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
      historyNeighborhood("minecraft", relations as Catalog["atlasRelations"])
        .edges,
    ).toEqual([]);
    expect(nodes.find((n) => n.id === "minecraft")?.summary["zh-CN"]).toContain(
      "早期公开版",
    );
  });
});
