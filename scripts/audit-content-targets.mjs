import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

function readJson(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const raw = readFileSync(absolutePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`无法解析 ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function normalizeCatalogUrl(value) {
  const url = new URL(value);
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  url.hash = '';
  if (url.pathname !== '/') {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }
  url.searchParams.sort();
  return url.toString();
}

function routeSummary({
  themeId,
  chain,
  evolutionRelationIds,
  carrierRelationIds,
  carrierCoverage,
  missingCarrierEventIds,
  missingEvidenceIds,
}) {
  return {
    themeId,
    chain,
    evolutionRelationIds,
    carrierRelationIds,
    carrierCoverage,
    missingCarrierEventIds,
    missingEvidenceIds,
  };
}

async function main() {
  // Node 24+ is invoked with --experimental-strip-types so this report and the
  // Vitest contract share the same route-audit implementation.
  const { auditAtlasRoutes } = await import('../src/lib/atlas-route-audit.ts');
  const resources = readJson('src/data/resources.json');
  const atlasNodes = readJson('src/data/atlas-nodes.json');
  const atlasRelations = readJson('src/data/atlas-relations.json');
  const atlasEvidence = readJson('src/data/atlas-evidence.json');
  const uniqueCanonicalUrls = new Set(
    resources.map(({ canonicalUrl }) => normalizeCatalogUrl(canonicalUrl)),
  ).size;
  const audits = auditAtlasRoutes(
    atlasNodes,
    atlasRelations,
    atlasEvidence.map(({ id }) => id),
    [
      'first-person-shooter-lineage',
      'role-playing-lineage',
      'real-time-strategy-lineage',
      'open-world-lineage',
    ],
  );
  const report = {
    resources: resources.length,
    uniqueCanonicalUrls,
    atlasNodes: atlasNodes.length,
    atlasRelations: atlasRelations.length,
    atlasEvidence: atlasEvidence.length,
    completeRoutes: audits.filter(({ complete }) => complete).map(routeSummary),
    incompleteRoutes: audits.filter(({ complete }) => !complete).map(routeSummary),
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.resources < 1000 || report.uniqueCanonicalUrls !== report.resources || report.completeRoutes.length < 3) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
