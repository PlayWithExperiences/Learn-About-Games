// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * Regression guards for the 2026-09-17 production loss.
 *
 * One item was recorded `failed(generation)` with the message "stacked_bar_chart card was
 * not ready after 900s (no card of this type appeared)". The same Studio list, read right
 * after the failure, returned all three finished cards. Two defects produced that:
 *
 *  1. A still-generating artifact is not rendered in the finished card shape. The panel
 *     showed "sync正在生成信息图…基于 1 个来源" — icon `sync`, artifact type inside the
 *     title — and the wait compared icons first, so its own "still generating" branch was
 *     unreachable and the timeout read as "the server produced nothing".
 *  2. The panel can stop reflecting the server. It kept showing the snapshot from while
 *     the artifact was still generating; a page reload was the only thing that ever
 *     cleared it.
 *
 * These tests drive the real decision walk through `--wait-plan`, so the assertions cannot
 * drift from `wait_for_card_events()` in `automation/run-notebooklm-item.py`. No browser,
 * no network, no ledger.
 */

const RUNNER = decodeURIComponent(
  new URL('../../automation/run-notebooklm-item.py', import.meta.url).pathname,
);

// Card strings exactly as the production Studio panel returned them on 2026-09-17.
const GENERATING = [
  'flowchart未读 独立游戏办公空间思维导图 1 个来源 · 1 分钟前 more_vert',
  'sync正在生成演示文稿… 基于 1 个来源',
  'sync正在生成信息图… 基于 1 个来源',
  'tablet Culture Is The Source Code 1 个来源 · 17 小时前 more_vert',
];
const FINISHED = [
  'tablet未读 Game Nest Devlog 1 个来源 · 8 分钟前 more_vert',
  'stacked_bar_chart未读 游戏共享空间建设指南 1 个来源 · 15 分钟前 more_vert',
  'flowchart未读 独立游戏办公空间思维导图 1 个来源 · 17 分钟前 more_vert',
  'tablet Culture Is The Source Code 1 个来源 · 17 小时前 more_vert',
];
const BASELINE: [string, string][] = [['tablet', 'Culture Is The Source Code']];

interface WaitEvent {
  event: string;
  reason?: string;
  card?: string;
  refreshes?: number;
  after_refresh?: boolean;
  source_selection_reset?: boolean;
}

interface WaitPlanResult {
  result: 'ready' | 'failure';
  title?: string;
  stage?: string;
  message?: string;
  reads: number;
  refreshes: number;
  events: WaitEvent[];
}

function waitPlan(plan: Record<string, unknown>): WaitPlanResult {
  const stdout = execFileSync('python3', [RUNNER, '--wait-plan'], {
    input: JSON.stringify(plan),
    encoding: 'utf8',
  });
  return JSON.parse(stdout);
}

describe('NotebookLM artifact card wait', () => {
  it('takes a finished card from a live panel without reloading', () => {
    const result = waitPlan({
      icon: 'stacked_bar_chart',
      known: BASELINE,
      reads: [GENERATING.slice(0, 2).concat(['stacked_bar_chart未读 游戏共享空间建设指南 1 个来源 · 1 分钟前 more_vert'])],
      timeout_sec: 900,
      stale_after_sec: 240,
      poll_sec: 15,
    });
    expect(result.result).toBe('ready');
    expect(result.title).toBe('游戏共享空间建设指南');
    expect(result.refreshes).toBe(0);
  });

  it('reloads a Studio panel that stopped updating and then finds the finished card', () => {
    // Five identical readings take the wait past the staleness window; the refresh is what
    // makes the finished card visible, which is exactly the 2026-09-17 sequence.
    const result = waitPlan({
      icon: 'stacked_bar_chart',
      known: BASELINE,
      reads: [...Array(5).fill(GENERATING), FINISHED],
      timeout_sec: 900,
      stale_after_sec: 60,
      poll_sec: 15,
    });
    expect(result.result).toBe('ready');
    expect(result.title).toBe('游戏共享空间建设指南');
    expect(result.refreshes).toBe(1);
    const refresh = result.events.find((e) => e.event === 'studio-refresh');
    expect(refresh?.reason).toBe('list unchanged');
    expect(refresh?.source_selection_reset).toBe(true);
    const ready = result.events.find((e) => e.event === 'card-ready');
    expect(ready?.after_refresh).toBe(true);
  });

  it('reports a generating artifact as generating, not as a missing card', () => {
    const result = waitPlan({
      icon: 'stacked_bar_chart',
      known: BASELINE,
      reads: [GENERATING],
      timeout_sec: 900,
      stale_after_sec: 300,
      poll_sec: 15,
    });
    expect(result.result).toBe('failure');
    expect(result.message).toContain('still generating');
    expect(result.message).toContain('正在生成信息图');
    expect(result.message).not.toContain('no card of this type appeared');
    // The final refresh is recorded, so a reader can see the panel was not left untried.
    expect(result.refreshes).toBeGreaterThan(0);
  });

  it('surfaces a server-side artifact failure with its real reason', () => {
    const result = waitPlan({
      icon: 'tablet',
      known: BASELINE,
      reads: [['error 未能生成演示文稿。请试试其他内容。 删除']],
      timeout_sec: 900,
      stale_after_sec: 300,
      poll_sec: 15,
    });
    expect(result.result).toBe('failure');
    expect(result.message).toContain('reported a generation failure');
    expect(result.message).toContain('未能生成演示文稿');
    expect(result.reads).toBe(1);
  });

  it('treats an empty panel reading as "not rendering", not as "no artifacts"', () => {
    // 2026-09-17 (second occurrence): a waiting run read an empty card list for its whole
    // cap, refreshed on the plain staleness timer, and reported "no card of this type
    // appeared" while the finished card sat in the notebook. An empty list must trigger the
    // refresh immediately instead of buying four quiet minutes.
    const result = waitPlan({
      icon: 'stacked_bar_chart',
      known: BASELINE,
      reads: [[], FINISHED],
      timeout_sec: 900,
      stale_after_sec: 240,
      poll_sec: 15,
    });
    expect(result.result).toBe('ready');
    expect(result.title).toBe('游戏共享空间建设指南');
    const refresh = result.events.find((e) => e.event === 'studio-refresh');
    expect(refresh?.reason).toBe('studio list empty');
  });

  it('never mistakes a pre-existing card of the same type for the new artifact', () => {
    const result = waitPlan({
      icon: 'stacked_bar_chart',
      known: [['stacked_bar_chart', '旧标题']],
      reads: [['stacked_bar_chart 旧标题 1 个来源 · 3 天前 more_vert']],
      timeout_sec: 60,
      stale_after_sec: 3600,
      poll_sec: 15,
    });
    expect(result.result).toBe('failure');
    expect(result.message).toContain('was not ready after 60s');
  });
});
