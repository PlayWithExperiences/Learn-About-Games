import type { Catalog, ExternalSignal, LocalizedText } from './catalog/validate';

type AccessVersion = Catalog['resources'][number]['accessVersions'][number];
type Source = Catalog['sources'][number];

const mediaLabels: Record<Catalog['resources'][number]['mediaType'], string> = {
  article: '文章',
  book: '书籍',
  course: '课程',
  paper: '论文',
  podcast: '播客',
  talk: '演讲',
  video: '视频',
  website: '网站',
};

const accessLabels: Record<AccessVersion['accessModel'], string> = {
  free: '免费',
  paid: '付费',
  subscription: '订阅',
};

const versionRelationLabels: Record<AccessVersion['versionRelation'], string> = {
  original: '原版',
  official: '官方译制',
  community: '社区译制',
};

const presentationModeLabels: Record<AccessVersion['presentationMode'], string> = {
  original: '原文',
  translated: '译文',
  bilingual: '双语',
  subtitled: '字幕',
  dubbed: '配音',
};

const sourceKindLabels: Record<Source['kind'], string> = {
  creator: '创作者',
  channel: '频道',
  organization: '机构',
  publisher: '出版方',
  website: '网站',
};

const languageLabels: Record<string, string> = {
  'zh-Hans': '中文',
  en: '英文',
  ja: '日文',
};

export const externalObservationCopy = {
  directoryNote: '按目录顺序列出。第三方来源只作为旁证记录，并标明具体旁证对象；不用于评分、排序或推荐。',
  disclosure: '查看访问版本与外部旁证',
  sectionTitle: '外部旁证',
  sourceNote: '以下记录会标明具体旁证对象（如视频简介首段、文章摘要或公开指标）；不等同于原始内容，也不构成本站评价、评分或排序。',
} as const;

export function formatMediaType(mediaType: Catalog['resources'][number]['mediaType']) {
  return mediaLabels[mediaType];
}

export function formatLanguage(language: string) {
  return languageLabels[language] ?? language;
}

export function formatSourceKind(kind: Source['kind']) {
  return sourceKindLabels[kind];
}

export function formatAccessModel(accessModel: AccessVersion['accessModel']) {
  return accessLabels[accessModel];
}

export function formatVersionRelation(versionRelation: AccessVersion['versionRelation']) {
  return versionRelationLabels[versionRelation];
}

export function formatPresentationMode(presentationMode: AccessVersion['presentationMode']) {
  return presentationModeLabels[presentationMode];
}

export function getResourceRelevanceDisplay(
  summary: string,
  whyRelevant?: string,
): Readonly<{ text: string | undefined; label: string | undefined }> {
  if (!whyRelevant?.trim()) {
    return {
      text: undefined,
      label: undefined,
    };
  }

  if (summary.trim() === whyRelevant.trim()) {
    return {
      text: summary.trim(),
      label: '来自来源页面的描述',
    };
  }

  return {
    text: whyRelevant,
    label: undefined,
  };
}

export function formatAccessVersion(
  version: Pick<AccessVersion, 'language' | 'accessModel' | 'versionRelation' | 'presentationMode' | 'checkedAt'>,
) {
  return `${version.language} · ${accessLabels[version.accessModel]} · ${versionRelationLabels[version.versionRelation]} · ${presentationModeLabels[version.presentationMode]} · 检查于 ${version.checkedAt}`;
}

export function formatRegionRestriction(restriction: { regions: string[]; note: LocalizedText }) {
  return `地区：${restriction.regions.join('、')} · ${restriction.note['zh-CN']}`;
}

export function formatExternalSignal(signal: Omit<ExternalSignal, 'url'>) {
  const sampleSize = signal.sampleSize ? ` · 样本：${signal.sampleSize}` : '';
  return `${signal.provider} · ${signal.label}：${signal.value}${sampleSize} · 观察于 ${signal.observedAt}`;
}
