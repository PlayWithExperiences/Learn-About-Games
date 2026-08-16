import type { Catalog } from './catalog/validate';

type Resource = Catalog['resources'][number];

export type LearningPathStageId =
  | 'observe'
  | 'understand'
  | 'deconstruct'
  | 'reconstruct'
  | 'integrate'
  | 'practice';

export type LearningPathStage = {
  id: LearningPathStageId;
  title: string;
  egdsAction?: '感受' | '理解' | '解构' | '重构';
  experienceLayer?: '情绪体验' | '主观感受' | '客观原因' | '设计杠杆';
  goal: string;
  practice: string;
  deliverable: string;
  exitCriteria: string;
  resources: Resource[];
};

export type LearningPath = {
  id: 'game-feel';
  title: string;
  summary: string;
  totalResourceCount: number;
  stages: LearningPathStage[];
};

type StageDefinition = Omit<LearningPathStage, 'resources'> & {
  resourceCount: number;
  preferredCapabilities: string[];
  preferredKnowledgeTopics: string[];
  preferredMediaTypes: Resource['mediaType'][];
  keywords: string[];
};

const stageDefinitions: StageDefinition[] = [
  {
    id: 'observe',
    title: '观察与描述',
    egdsAction: '感受',
    experienceLayer: '情绪体验',
    goal: '先把手感当成可观察的体验，而不是马上把它归结为某个参数。',
    practice: '选一个熟悉的动作，分别记录输入、等待、动作、反馈和身体感受；至少做一次慢速与一次快速记录。',
    deliverable: '一张“输入 → 动作 → 反馈 → 感受”的体验记录表。',
    exitCriteria: '能够用具体动词和时序描述一次手感，不只写“爽”“不爽”或“有延迟”。',
    resourceCount: 12,
    preferredCapabilities: ['game-feel-tuning', 'player-perspective-taking', 'design-critique-feedback'],
    preferredKnowledgeTopics: ['perception-attention-emotion', 'audiovisual-semiotics'],
    preferredMediaTypes: ['video', 'talk', 'article', 'website'],
    keywords: ['feel', 'feedback', 'sensation', 'input', 'animation', 'sound', '手感', '反馈', '感受'],
  },
  {
    id: 'understand',
    title: '理解体验',
    egdsAction: '理解',
    experienceLayer: '主观感受',
    goal: '理解知觉、注意、情绪和视听线索如何共同形成“好用”或“有重量”的主观感受。',
    practice: '对同一动作做两种反馈版本，记录玩家注意到了什么、预期如何形成、情绪如何变化。',
    deliverable: '一份体验假设表，写清楚线索、预期、感受和可观察证据。',
    exitCriteria: '能够把主观感受连接到至少两种可观察线索，并指出它们可能互相冲突的地方。',
    resourceCount: 18,
    preferredCapabilities: ['game-feel-tuning', 'multimodal-presentation-integration', 'emotional-arc-shaping'],
    preferredKnowledgeTopics: ['perception-attention-emotion', 'audiovisual-semiotics', 'emergence-complexity'],
    preferredMediaTypes: ['article', 'talk', 'paper', 'course'],
    keywords: ['perception', 'attention', 'emotion', 'audio', 'visual', 'feel', '体验', '知觉', '情绪'],
  },
  {
    id: 'deconstruct',
    title: '解构问题',
    egdsAction: '解构',
    experienceLayer: '客观原因',
    goal: '把感受到的问题拆成输入、运动、时序、规则、节奏和反馈回路。',
    practice: '对一个问题做变量拆解，逐项关闭或替换反馈，再比较问题是否仍然存在。',
    deliverable: '一张问题树和一组最小可复现实验。',
    exitCriteria: '能够区分体验症状、可能原因和仍需验证的假设，不把第一个猜测当成结论。',
    resourceCount: 24,
    preferredCapabilities: ['experience-deconstruction', 'rules-system-modeling', 'pacing-control', 'design-critique-feedback'],
    preferredKnowledgeTopics: ['perception-attention-emotion', 'emergence-complexity', 'spatial-cognition-wayfinding'],
    preferredMediaTypes: ['talk', 'article', 'paper', 'course'],
    keywords: ['analysis', 'design', 'system', 'timing', 'pacing', 'frame', 'mechanic', '拆解', '系统', '节奏'],
  },
  {
    id: 'reconstruct',
    title: '重构设计',
    egdsAction: '重构',
    experienceLayer: '设计杠杆',
    goal: '把原因转成可以试做、比较和回退的设计杠杆，而不是直接堆更多特效。',
    practice: '只改变一个杠杆，制作两个可比较版本；把输入、运动、挑战、动画、声音和镜头分别写成假设。',
    deliverable: '一组带版本号的手感实验，以及每次改动的预期和结果。',
    exitCriteria: '能够解释每个改动想改变哪一种感受，并保留失败版本作为比较证据。',
    resourceCount: 24,
    preferredCapabilities: ['game-feel-tuning', 'multimodal-presentation-integration', 'challenge-difficulty-design', 'pacing-control'],
    preferredKnowledgeTopics: ['audiovisual-semiotics', 'perception-attention-emotion', 'emergence-complexity'],
    preferredMediaTypes: ['article', 'talk', 'video', 'course'],
    keywords: ['animation', 'sound', 'camera', 'movement', 'combat', 'tuning', 'design', '调校', '动画', '声音'],
  },
  {
    id: 'integrate',
    title: '系统整合',
    goal: '把局部手感放回情绪弧线、表达意图、节奏和团队协作中，检查它是否服务于整体体验。',
    practice: '把一次局部调校放进完整流程，邀请另一位协作者用同一张观察表复核。',
    deliverable: '一页系统影响图：局部改动影响了哪些体验、表达和生产决策。',
    exitCriteria: '能够说明什么时候应该保留局部不一致，以及它如何服务更大的体验目的。',
    resourceCount: 14,
    preferredCapabilities: ['experience-framing', 'emotional-arc-shaping', 'cross-discipline-communication', 'design-critique-feedback'],
    preferredKnowledgeTopics: ['perception-attention-emotion', 'organizational-dynamics-power', 'games-values-culture'],
    preferredMediaTypes: ['talk', 'article', 'course', 'book'],
    keywords: ['experience', 'team', 'communication', 'direction', 'arc', 'design', '系统', '团队', '表达'],
  },
  {
    id: 'practice',
    title: '综合实践',
    goal: '完成一次完整的手感实验，把观察、解释、拆解、改动和复盘串成可复用记录。',
    practice: '从一个真实项目或练习原型中选一个动作，完成基线、改动、对比测试和复盘。',
    deliverable: '一份可分享的手感案例：问题、证据、版本、结果、局限和下一步。',
    exitCriteria: '别人可以根据你的记录复现判断过程，而不必接受你给出的单一结论。',
    resourceCount: 8,
    preferredCapabilities: ['game-feel-tuning', 'design-critique-feedback', 'experience-deconstruction', 'pacing-control'],
    preferredKnowledgeTopics: ['perception-attention-emotion', 'emergence-complexity'],
    preferredMediaTypes: ['course', 'talk', 'video', 'article'],
    keywords: ['case', 'prototype', 'postmortem', 'practice', 'feedback', 'iteration', '案例', '原型', '复盘'],
  },
];

function compareIds(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function scoreResource(resource: Resource, definition: StageDefinition) {
  const text = [
    resource.title['zh-CN'],
    resource.title.en,
    resource.summary['zh-CN'],
    resource.summary.en,
    resource.whyRelevant['zh-CN'],
    resource.whyRelevant.en,
  ].filter(Boolean).join(' ').toLocaleLowerCase();

  return (
    definition.preferredCapabilities.reduce(
      (score, capabilityId) => score + (resource.capabilityIds.includes(capabilityId) ? 10 : 0),
      0,
    )
    + definition.preferredKnowledgeTopics.reduce(
      (score, topicId) => score + (resource.knowledgeTopicIds.includes(topicId) ? 7 : 0),
      0,
    )
    + (definition.preferredMediaTypes.includes(resource.mediaType) ? 3 : 0)
    + definition.keywords.reduce((score, keyword) => score + (text.includes(keyword.toLocaleLowerCase()) ? 1 : 0), 0)
  );
}

export function buildGameFeelLearningPath(resources: Resource[]): LearningPath {
  const eligible = resources.filter(({ resourceTopicIds }) => resourceTopicIds.includes('game-feel-feedback'));
  const requestedCount = stageDefinitions.reduce((sum, stage) => sum + stage.resourceCount, 0);

  if (eligible.length < requestedCount) {
    throw new Error(`手感与反馈成长路径至少需要 100 条资料，当前只有 ${eligible.length} 条`);
  }

  const available = new Map(eligible.map((resource) => [resource.id, resource]));
  const stages = stageDefinitions.map((definition) => {
    const selected = [...available.values()]
      .sort((left, right) => scoreResource(right, definition) - scoreResource(left, definition) || compareIds(left.id, right.id))
      .slice(0, definition.resourceCount);

    for (const resource of selected) available.delete(resource.id);

    return {
      id: definition.id,
      title: definition.title,
      egdsAction: definition.egdsAction,
      experienceLayer: definition.experienceLayer,
      goal: definition.goal,
      practice: definition.practice,
      deliverable: definition.deliverable,
      exitCriteria: definition.exitCriteria,
      resources: selected,
    } satisfies LearningPathStage;
  });

  return {
    id: 'game-feel',
    title: '手感与反馈成长路径',
    summary: '把“好不好用”从模糊印象变成可观察、可解释、可试做和可复盘的设计过程。',
    totalResourceCount: requestedCount,
    stages,
  };
}
