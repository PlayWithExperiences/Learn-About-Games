import { describe, expect, it } from 'vitest';

import {
  formatAccessVersion,
  formatExternalSignal,
  formatMediaType,
  formatRegionRestriction,
} from '../../src/lib/resource-display';

describe('resource factual display', () => {
  it('labels every supported media and the two orthogonal access-version dimensions', () => {
    expect(formatMediaType('article')).toBe('文章');
    expect(formatMediaType('book')).toBe('书籍');
    expect(formatMediaType('course')).toBe('课程');
    expect(formatMediaType('paper')).toBe('论文');
    expect(formatMediaType('podcast')).toBe('播客');
    expect(formatMediaType('talk')).toBe('演讲');
    expect(formatMediaType('video')).toBe('视频');
    expect(formatMediaType('website')).toBe('网站');
    expect(
      formatAccessVersion({
        language: 'en',
        accessModel: 'free',
        versionRelation: 'official',
        presentationMode: 'bilingual',
        checkedAt: '2026-08-09',
      }),
    ).toBe('en · 免费 · 官方译制 · 双语 · 检查于 2026-08-09');
  });

  it('keeps region restrictions and external observations factual when present', () => {
    expect(
      formatRegionRestriction({
        regions: ['CN', 'HK'],
        note: { 'zh-CN': '仅限指定地区。' },
      }),
    ).toBe('地区：CN、HK · 仅限指定地区。');
    expect(
      formatExternalSignal({
        provider: 'Example Index',
        label: '公开计数',
        value: '12,000',
        sampleSize: '24 条评论',
        observedAt: '2026-08-09',
      }),
    ).toBe('Example Index · 公开计数：12,000 · 样本：24 条评论 · 观察于 2026-08-09');
  });
});
