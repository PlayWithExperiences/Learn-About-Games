import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { historyTracks, historyRoutes, trackFor } from '../src/lib/innovation-history.ts';

// Run from the repository root. Uses the same territory assignment as the UI.
const inputs = ['atlas-nodes', 'atlas-relations', 'atlas-evidence'].map(name => `src/data/${name}.json`);
const [nodes, relations, evidence] = inputs.map(path => JSON.parse(readFileSync(path, 'utf8')));
const connected = new Set(relations.flatMap(r => [r.fromId, r.toId]));
const territories = historyTracks.map(track => {
  const members = nodes.filter(node => trackFor(node) === track.id);
  return {
    id: track.id,
    title: track.title,
    count: members.length,
    kinds: Object.fromEntries([...new Set(members.map(n => n.kind))].map(kind => [kind, members.filter(n => n.kind === kind).length])),
    years: members.length ? [Math.min(...members.map(n => n.startYear)), Math.max(...members.map(n => n.startYear))] : null,
    isolated: members.filter(n => !connected.has(n.id)).map(n => n.id),
  };
});
if (territories.reduce((sum, t) => sum + t.count, 0) !== nodes.length)
  throw new Error('Territory inventory does not reconcile with the catalog');
for (const route of historyRoutes)
  for (const id of route.ids)
    if (!nodes.some(n => n.id === id)) throw new Error(`Missing route object: ${id}`);
const paths = [...inputs, 'src/lib/innovation-history.ts'];
console.log(JSON.stringify({
  updatedAt: new Date().toISOString(),
  counts: { nodes: nodes.length, relations: relations.length, evidence: evidence.length },
  territories,
  routes: historyRoutes.map(({ id, title, ids }) => ({ id, title, nodeIds: ids })),
  inputs: Object.fromEntries(paths.map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')])),
  note: 'Catalog inventory, not a percentage of all game history. No recorded relation does not imply no historical influence. Geography is not inferred from language.',
}, null, 2));
