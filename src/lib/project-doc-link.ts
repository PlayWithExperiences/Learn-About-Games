import { joinBase } from './site-path';

const repositoryBlobUrl =
  'https://github.com/PlayWithExperiences/Learn-About-Games/blob/main/';

const publicProjectDocs = new Map([
  ['README.md', 'readme'],
  ['METHODOLOGY.md', 'methodology'],
  ['CONTRIBUTING.md', 'contributing'],
  ['ROADMAP.md', 'roadmap'],
  ['CHANGELOG.md', 'changelog'],
]);

function splitHref(href: string): { path: string; suffix: string } {
  const suffixIndex = href.search(/[?#]/);
  if (suffixIndex === -1) {
    return { path: href, suffix: '' };
  }

  return {
    path: href.slice(0, suffixIndex),
    suffix: href.slice(suffixIndex),
  };
}

function normalizeRepositoryPath(path: string): string {
  const segments: string[] = [];

  for (const segment of path.replaceAll('\\', '/').split('/')) {
    if (segment === '' || segment === '.') {
      continue;
    }

    if (segment === '..') {
      segments.pop();
      continue;
    }

    segments.push(segment);
  }

  return segments.join('/');
}

export function resolveProjectDocHref(
  href: string,
  sourceFilePath: string,
  basePath: string,
): string {
  if (/^(?:#|https?:|mailto:)/i.test(href) || href.startsWith('/')) {
    return href;
  }

  const { path, suffix } = splitHref(href);
  if (!path.toLowerCase().endsWith('.md')) {
    return href;
  }

  const normalizedSourcePath = sourceFilePath.replaceAll('\\', '/');
  const sourceDirectory = normalizedSourcePath.includes('/')
    ? normalizedSourcePath.slice(0, normalizedSourcePath.lastIndexOf('/'))
    : '';
  const repositoryPath = normalizeRepositoryPath(`${sourceDirectory}/${path}`);
  const publicSlug = publicProjectDocs.get(repositoryPath);

  if (publicSlug) {
    return `${joinBase(basePath, `project/${publicSlug}/`)}${suffix}`;
  }

  if (/^docs\/devlog\/[^/]+\.md$/i.test(repositoryPath)) {
    const filename = repositoryPath.slice(repositoryPath.lastIndexOf('/') + 1);
    const slug = filename.replace(/\.md$/i, '');
    return `${joinBase(basePath, `devlog/${slug}/`)}${suffix}`;
  }

  return `${repositoryBlobUrl}${repositoryPath}${suffix}`;
}

export function rewriteProjectDocLinks(
  html: string,
  sourceFilePath: string,
  basePath: string,
): string {
  return html.replace(
    /(<a\b[^>]*\bhref=")([^"]*)(")/gi,
    (_match, before: string, href: string, after: string) =>
      `${before}${resolveProjectDocHref(href, sourceFilePath, basePath)}${after}`,
  );
}
