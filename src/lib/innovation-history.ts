import type { Catalog } from "./catalog/validate";

export const historyEras = [
  { start: 1950, end: 1969, label: "1950–60s", title: "实验与显示" },
  { start: 1970, end: 1979, label: "1970s", title: "走出实验室" },
  { start: 1980, end: 1989, label: "1980s", title: "规则与类型分化" },
  { start: 1990, end: 1999, label: "1990s", title: "空间与系统扩展" },
  { start: 2000, end: 2009, label: "2000s", title: "联网与跨界" },
  { start: 2010, end: 2019, label: "2010s", title: "重组与独立表达" },
  { start: 2020, end: 2029, label: "2020s", title: "持续演变" },
];

// Editorial reading territories, not mutually exclusive historical genres.
// One home per entity prevents duplication; tags and edges preserve crossings.
export const historyTracks = [
  {
    id: "origins",
    title: "媒介与实验",
    subtitle: "从实验设备到家用系统",
    tags: ["early-electronic-games-lens"],
  },
  {
    id: "platform",
    title: "动作与平台",
    subtitle: "跳跃、移动与关卡",
    tags: ["platform-jumping-lens"],
  },
  {
    id: "exploration",
    title: "探索与开放空间",
    subtitle: "能力解锁、连接与自由路线",
    tags: ["metroidvania-lens", "open-world-lineage", "zelda-lineage"],
  },
  {
    id: "adventure",
    title: "叙事与解谜",
    subtitle: "文本、图形与空间规则",
    tags: ["parser-graphical-adventure-lens", "puzzle-history"],
  },
  {
    id: "rpg",
    title: "角色与单局循环",
    subtitle: "成长、风险与重新开始",
    tags: ["roguelike-lens", "role-playing-lineage", "rpg-progression"],
  },
  {
    id: "fps",
    title: "射击与第一人称",
    subtitle: "视角、对抗与沉浸",
    tags: ["first-person-shooter-lens", "battle-royale-history"],
  },
  {
    id: "strategy",
    title: "策略与团队对抗",
    subtitle: "回合规划、实时调度与英雄对抗",
    tags: ["real-time-strategy-lens", "turn-based-strategy-history", "moba-history"],
  },
  {
    id: "simulation",
    title: "模拟与建造",
    subtitle: "自定目标、资源与生产",
    tags: ["simulation-history"],
  },
  { id: "online", title: "在线世界", subtitle: "持续世界、制作与玩家社会", tags: ["social-worlds-history"] },
  { id: "cards", title: "卡牌与单局构筑", subtitle: "规则组合、风险与重新开始", tags: ["card-history"] },
  { id: "fighting", title: "格斗与对人竞技", subtitle: "角色差异、必杀技与连击", tags: ["fighting-history"] },
  { id: "music", title: "音乐与表演", subtitle: "节奏与共同表演", tags: ["music-history"] },
  {
    id: "physical",
    title: "体育与身体输入",
    subtitle: "运动规则与体感控制",
    tags: ["physical-play-history"],
  },
];

export function trackFor(
  node: Pick<Catalog["atlasNodes"][number], "id" | "tags">,
): string {
  if (node.tags.includes("card-history")) return "cards";
  // Hybrids appear once in the area best suited to their reading context.
  if (node.id === "dead-cells" || node.id === "spelunky") return "rpg";
  return (
    historyTracks.find((track) =>
      track.tags.some((tag) => node.tags.includes(tag)),
    )?.id ?? "rpg"
  );
}

export const historyRoutes = [
  {
    id: "runs",
    title: "失败之后，什么留下来？",
    text: "从每局重建的地城，经动作与平台结构的转译，到让角色记住死亡的叙事。点选节点查看具体变化；只把有来源支持的关系画成连线。",
    ids: [
      "rogue",
      "moria",
      "angband",
      "diablo",
      "procedural-run-structure",
      "spelunky",
      "dead-cells",
      "hades",
      "slay-the-spire",
      "vampire-survivors",
      "luck-be-a-landlord",
      "balatro",
    ],
  },
  {
    id: "space",
    title: "空间怎样成为玩法？",
    text: "对照能力解锁的回访、三维战斗的目标锁定与开放世界的系统规则。这是一组比较阅读，不宣称所有作品构成单一影响链。",
    ids: [
      "metroid",
      "super-metroid",
      "castlevania-symphony-of-the-night",
      "ocarina-of-time",
      "ultima",
      "jx3-yidai-zongshi",
      "genshin-impact",
      "grand-theft-auto",
      "breath-of-the-wild",
      "hollow-knight",
      "dead-cells",
    ],
  },
  {
    id: "worlds",
    title: "从通关到生活在世界里",
    text: "资源竞争、日常模拟、在线社群和自由建造让目标来源变得多样。有来源的影响与相似关系分别标记；未连线的对象仍可比较阅读。",
    ids: [
      "mule",
      "simcity",
      "civilization",
      "dikumud",
      "legendmud",
      "ultima-online",
      "dwarf-fortress",
      "factorio",
      "the-sims",
      "everquest",
      "eve-online",
      "world-of-warcraft",
      "minecraft",
    ],
  },
];

export const historyRelationLabels: Record<string, string> = {
  "direct-influence": "直接影响",
  "derived-variant": "派生变体",
  fusion: "结构融合",
  revival: "复兴",
  "parallel-origin": "平行产生",
  "structural-similarity": "结构相似，影响未知",
  "prototype-to-product": "原型到产品",
  "commercialized-as": "商业化改作",
  "design-response": "设计回应",
  disputed: "存在争议",
};
export const historyStatusLabels: Record<string, string> = {
  confirmed: "直接来源支持",
  credible: "历史综合",
  inferred: "推断",
  disputed: "有争议",
};
export const historyKindLabels: Record<string, string> = {
  game: "作品",
  innovation: "创新观察",
  category: "类别形成",
  "experimental-apparatus": "实验设备",
  "experimental-program": "实验程序",
  "system-prototype": "系统原型",
  "commercial-hardware": "商业硬件",
};

export function historyNeighborhood(
  id: string,
  relations: Catalog["atlasRelations"],
) {
  const edges = relations.filter(
    (edge) => edge.fromId === id || edge.toId === id,
  );
  return {
    edges,
    nodeIds: new Set([
      id,
      ...edges.flatMap((edge) => [edge.fromId, edge.toId]),
    ]),
  };
}
