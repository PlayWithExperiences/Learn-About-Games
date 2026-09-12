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
    ).toEqual([]);
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
    expect(relations.find(r => r.id === 'ultima-to-dragon-quest')).toMatchObject({directionality:'undirected'});
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
    expect(relations.find(r => r.id === 'ddr-and-guitar-hero')).toMatchObject({type:'structural-similarity',directionality:'undirected',status:'inferred'});
    expect(relations.find(r => r.id === 'allstars-to-league')).toMatchObject({type:'design-response'});
  });
});
