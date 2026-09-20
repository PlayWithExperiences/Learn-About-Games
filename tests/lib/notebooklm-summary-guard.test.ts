// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * Regression guard for the 2026-09-20 production loss.
 *
 * The summary stage used to fail an item outright whenever the summary mentioned
 * "辐射4"/"Fallout", on the theory that only cross-source contamination could put that
 * word there (a Fallout 4 lecture shared the production notebook back in 2026-09-13).
 * On 2026-09-20 the candidate "A Torch in the Dark" (a Darkest Dungeon lecture) was
 * failed that way even though the source viewer confirmed the lecture itself uses
 * Fallout 4 as an example — a hardcoded keyword match burned a daily claim on a
 * correct summary.
 *
 * A keyword hit is now only a tripwire: the runner asks the same isolated single
 * source for verbatim proof and decides on that evidence. The rule lives in one place
 * (`find_suspect_terms` / `suspect_evidence_verdict` in
 * automation/run-notebooklm-item.py). These tests call it through its
 * `--suspect-verdict` mode rather than re-implementing it, so the assertion cannot
 * drift away from the code that actually runs in production.
 */

const RUNNER = decodeURIComponent(
  new URL('../../automation/run-notebooklm-item.py', import.meta.url).pathname,
);

interface VerdictCase {
  summary: string;
  boundary: string;
  probe_answer: string;
}

interface Verdict {
  terms: string[];
  passed: boolean;
  reason: string;
}

function verdicts(cases: VerdictCase[]): Verdict[] {
  const stdout = execFileSync('python3', [RUNNER, '--suspect-verdict'], {
    input: JSON.stringify(cases),
    encoding: 'utf8',
  });
  return JSON.parse(stdout);
}

describe('NotebookLM summary suspect-term guard', () => {
  it('passes a source-supported Fallout mention confirmed with a verbatim quote', () => {
    // The 2026-09-20 false positive: the Darkest Dungeon lecture itself discusses
    // Fallout 4, and the isolated source confirms it with a direct quote.
    const [result] = verdicts([
      {
        summary: '……演讲以 Fallout 4 的定居点建造为例，说明创意方向如何约束系统……',
        boundary: '来源边界：未覆盖具体数值。',
        probe_answer:
          '来源提到了 Fallout 4，原句为：“我们可以看看 Fallout 4 的做法”。',
      },
    ]);

    expect(result.terms).toEqual(['Fallout']);
    expect(result.passed).toBe(true);
  });

  it('fails when the source denies the mention (real contamination)', () => {
    const [result] = verdicts([
      {
        summary: '……Fallout 4 的模块化关卡设计……',
        boundary: '来源边界：无。',
        probe_answer: '来源未提到。',
      },
    ]);

    expect(result.terms).toEqual(['Fallout']);
    expect(result.passed).toBe(false);
  });

  it('lets denial win when the answer echoes the term while denying it', () => {
    const [result] = verdicts([
      {
        summary: '……辐射4 的例子……',
        boundary: '来源边界：无。',
        probe_answer: '来源没有提到辐射4，总结中的例子来自其他来源。',
      },
    ]);

    expect(result.terms).toEqual(['辐射4']);
    expect(result.passed).toBe(false);
  });

  it('fails safe on an evasive answer that neither confirms nor denies', () => {
    const [result] = verdicts([
      {
        summary: '……Fallout 4……',
        boundary: '来源边界：无。',
        probe_answer: '我无法确定来源是否提到了这个内容。',
      },
    ]);

    expect(result.passed).toBe(false);
  });

  it('needs no verification when no suspect term appears', () => {
    const [result] = verdicts([
      {
        summary: '……地牢的火把机制……',
        boundary: '来源边界：无。',
        probe_answer: '',
      },
    ]);

    expect(result.terms).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it('detects the Chinese term in the boundary text as well', () => {
    const [confirmed, denied] = verdicts([
      {
        summary: '……设计取舍……',
        boundary: '来源边界：演讲还对比了辐射4 的做法。',
        probe_answer: '来源提到了辐射4，原句为：“辐射4 的做法值得参考”。',
      },
      {
        summary: '……设计取舍……',
        boundary: '来源边界：演讲还对比了辐射4 的做法。',
        probe_answer: '来源未提及辐射4。',
      },
    ]);

    expect(confirmed.terms).toEqual(['辐射4']);
    expect(confirmed.passed).toBe(true);
    expect(denied.passed).toBe(false);
  });
});
