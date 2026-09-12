import { describe, expect, it } from "vitest";
import nodes from "../../src/data/atlas-nodes.json";
import relations from "../../src/data/atlas-relations.json";
import {
  historyEras,
  historyTracks,
  historyRoutes,
  trackFor,
  historyNeighborhood,
} from "../../src/lib/innovation-history";
import type { Catalog } from "../../src/lib/catalog/validate";

describe("history overview reading contract", () => {
  it("places every historical object exactly once in a labelled era and territory", () => {
    for (const node of nodes) {
      expect(
        historyEras.filter(
          (e) => node.startYear >= e.start && node.startYear <= e.end,
        ),
        node.id,
      ).toHaveLength(1);
      expect(
        historyTracks.filter((t) => t.id === trackFor(node)),
        node.id,
      ).toHaveLength(1);
      expect(
        historyTracks.some((t) =>
          t.tags.some((tag) => node.tags.includes(tag)),
        ),
        `explicit placement for ${node.id}`,
      ).toBe(true);
    }
  });
  it("keeps cross-genre evidence intact when a hybrid has one reading position", () => {
    const { edges, nodeIds } = historyNeighborhood(
      "dead-cells",
      relations as Catalog["atlasRelations"],
    );
    expect(edges.length).toBeGreaterThan(0);
    expect(nodeIds.has("dead-cells")).toBe(true);
    expect(edges.some((e) => e.tags.includes("metroidvania-lens"))).toBe(true);
    expect(edges.some((e) => e.tags.includes("roguelike-lens"))).toBe(true);
  });
  it("never turns comparison reading order or museum anchors into influence edges", () => {
    for (const route of historyRoutes)
      for (const id of route.ids)
        expect(nodes.some((n) => n.id === id)).toBe(true);
    expect(
      historyNeighborhood("tetris", relations as Catalog["atlasRelations"])
        .edges,
    ).toEqual([expect.objectContaining({id:"tetris-to-game-boy",type:"derived-variant"})]);
    expect(nodes.find((n) => n.id === "minecraft")?.summary["zh-CN"]).toContain(
      "早期公开版",
    );
  });
});

describe('approved expansion evidence boundaries', () => {
  it('distinguishes declared edition dates from original releases', () => {
    expect(nodes.find(n => n.id === 'disco-elysium-final-cut')).toMatchObject({startYear:2021});
    expect(nodes.find(n => n.id === 'disco-elysium-final-cut')?.summary['zh-CN']).toContain('不是原作');
    expect(nodes.find(n => n.id === 'jx3')?.startYear).toBe(2009);
    expect(nodes.find(n => n.id === 'jx3-yidai-zongshi')?.startYear).toBe(2011);
    expect(nodes.find(n => n.id === 'balatro')?.startYear).toBe(2024);
  });
  it('keeps documented influence separate from similarity and indirect references', () => {
    const spire = nodes.find(n => n.id === 'slay-the-spire')!;
    expect(spire.tags).toContain('roguelike-lens');
    expect(trackFor(spire)).toBe('cards');
    expect(relations.find(r => r.id === 'landlord-to-balatro')).toMatchObject({type:'direct-influence',status:'confirmed',directionality:'directed'});
    expect(relations.find(r => r.id === 'ultima-to-dragon-quest')).toMatchObject({type:'direct-influence',directionality:'directed',status:'credible'});
    expect(relations.find(r => r.id === 'ultima-online-and-minecraft')).toMatchObject({type:'structural-similarity',directionality:'undirected'});
    expect(relations.some(r => r.fromId === 'slay-the-spire' && r.toId === 'balatro')).toBe(false);
    expect(relations.some(r => r.fromId === 'minecraft' && r.toId === 'factorio')).toBe(false);
  });
});

describe('mod and performance history boundaries', () => {
  it('locates creation and release contexts without turning hosts into inspirations', () => {
    expect(nodes.find(n => n.id === 'dota-eul')?.summary['zh-CN']).toContain('创作阶段');
    expect(nodes.find(n => n.id === 'buildcraft')?.summary['zh-CN']).toContain('仅有管道');
    expect(nodes.find(n => n.id === 'team-fortress-quake')?.summary['zh-CN']).toContain('尚无团队');
    expect(relations.find(r => r.id === 'minecraft-to-buildcraft')).toMatchObject({type:'derived-variant'});
    expect(relations.find(r => r.id === 'buildcraft-to-factorio')).toMatchObject({type:'direct-influence'});
    expect(relations.find(r => r.id === 'ddr-and-guitar-hero')).toMatchObject({type:'structural-similarity',directionality:'undirected',status:'credible'});
    expect(relations.find(r => r.id === 'allstars-to-league')).toMatchObject({type:'design-response'});
  });
});

describe('spatial and practice history evidence', () => {
  it('separates a retrospective similarity from an explicit design response', () => {
    expect(relations.find(r => r.id === 'prime-and-outer-wilds')).toMatchObject({type:'structural-similarity',directionality:'undirected'});
    expect(relations.find(r => r.id === 'dark-souls-to-outer-wilds')).toMatchObject({type:'design-response',directionality:'directed'});
    expect(nodes.find(n => n.id === 'metroid-prime-jp')?.summary['zh-CN']).toContain('日本');
    expect(nodes.find(n => n.id === 'gt7-spec-iii')?.startYear).toBe(2025);
    expect(relations.find(r => r.id === 'gt7-to-spec3')).toMatchObject({fromId:'gran-turismo-7',toId:'gt7-spec-iii',type:'derived-variant'});
  });
});

describe('mobile and contemporary release boundaries', () => {
  it('keeps later editions and early access explicit', () => {
    expect(nodes.find(n => n.id === 'fruit-ninja-hd-2012')?.summary['zh-CN']).toContain('不是HD版本首次发行');
    expect(nodes.find(n => n.id === 'slay-the-spire-2-ea')?.summary['zh-CN']).toContain('不是完整1.0');
    expect(nodes.find(n => n.id === 'hades-ii-v1')?.startYear).toBe(2025);
    expect(relations.find(r => r.id === 'ingress-to-pokemon-go')).toMatchObject({type:'direct-influence',status:'confirmed'});
    expect(relations.find(r => r.id === 'factorio-and-dyson')).toMatchObject({directionality:'undirected',status:'credible'});
  });
});

describe('tabletop and prototype identity', () => {
  it('preserves tabletop predecessors and separates the early MUD prototype', () => {
    for (const id of ['dungeons-and-dragons-1974','magic-the-gathering','dominion'])
      expect(nodes.find(n => n.id === id)?.kind).toBe('tabletop-game');
    expect(nodes.find(n => n.id === 'mud-1978-prototype')?.kind).toBe('experimental-program');
    expect(relations.find(r => r.id === 'dominion-to-spire')).toMatchObject({type:'direct-influence',status:'confirmed'});
  });
});


describe('full claim verification corrections', () => {
  it('preserves source-confirmed influence and separates the Dominion counterexample', () => {
    for (const id of ['vf-and-tekken', 'portal-and-monument-valley']) {
      expect(relations.find(r => r.id === id)).toMatchObject({ type: 'direct-influence', status: 'confirmed', directionality: 'directed' });
    }
    expect(relations.find(r => r.id === 'magic-and-dominion')).toMatchObject({ type: 'structural-similarity', status: 'confirmed', directionality: 'undirected' });
    expect(relations.find(r => r.id === 'magic-and-dominion')?.evidenceIds).toContain('vaccarino-dominion-origin');
  });
  it('does not turn editorial comparisons into causal arrows', () => {
    for (const id of ['rpg-party-to-procedural-risk', 'fps-vertical-to-open-modding', 'open-world-systemic-to-self-directed']) {
      expect(relations.find(r => r.id === id)).toMatchObject({ type: 'structural-similarity', directionality: 'undirected' });
    }
    expect(relations.find(r => r.id === 'rpg-party-identity-to-wizardry')?.toId).toBe('wizardry');
    expect(relations.find(r => r.id === 'rpg-party-identity-to-diablo')).toBeUndefined();
  });
});
