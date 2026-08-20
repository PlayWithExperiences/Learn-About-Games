import { describe, expect, it } from 'vitest';

import {
  formatAccessVersion,
  formatAccessModel,
  formatExternalSignal,
  formatLanguage,
  formatMediaType,
  formatPresentationMode,
  formatRegionRestriction,
  getResourceRelevanceDisplay,
  formatSourceKind,
  formatVersionRelation,
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
    expect(formatLanguage('zh-Hans')).toBe('中文');
    expect(formatLanguage('en')).toBe('英文');
    expect(formatLanguage('ja')).toBe('日文');
    expect(formatLanguage('fr')).toBe('fr');
    expect(formatSourceKind('creator')).toBe('创作者');
    expect(formatSourceKind('channel')).toBe('频道');
    expect(formatSourceKind('organization')).toBe('机构');
    expect(formatSourceKind('publisher')).toBe('出版方');
    expect(formatSourceKind('website')).toBe('网站');
    expect(formatAccessModel('subscription')).toBe('订阅');
    expect(formatVersionRelation('official')).toBe('官方译制');
    expect(formatPresentationMode('bilingual')).toBe('双语');
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

  it('renders one source description when summary and whyRelevant only differ in whitespace', () => {
    expect(getResourceRelevanceDisplay('  来源页面描述。  ', '来源页面描述。')).toEqual({
      text: '来源页面描述。',
      label: '来自来源页面的描述',
    });
  });

  it('keeps the independent whyRelevant text when summary and whyRelevant differ', () => {
    expect(getResourceRelevanceDisplay('来源页面描述。', '它直接讨论如何把反馈转成设计判断。')).toEqual({
      text: '它直接讨论如何把反馈转成设计判断。',
      label: undefined,
    });
  });

  it('does not invent relevance text when no independent basis was recorded', () => {
    expect(getResourceRelevanceDisplay('只记录标题和来源。', undefined)).toEqual({
      text: undefined,
      label: undefined,
    });
  });
});
