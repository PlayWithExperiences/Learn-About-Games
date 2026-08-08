import { describe, expect, it } from 'vitest';

import { resolveProjectDocHref, rewriteProjectDocLinks } from '../../src/lib/project-doc-link';

const base = '/Learn-About-Games/';

describe('resolveProjectDocHref', () => {
  it.each([
    '#local-section',
    'mailto:hello@example.com',
    'http://example.com/guide',
    'https://example.com/guide',
  ])('preserves %s', (href) => {
    expect(resolveProjectDocHref(href, 'README.md', base)).toBe(href);
  });

  it.each([
    ['README.md', '/Learn-About-Games/project/readme/'],
    ['METHODOLOGY.md', '/Learn-About-Games/project/methodology/'],
    ['CONTRIBUTING.md', '/Learn-About-Games/project/contributing/'],
    ['ROADMAP.md', '/Learn-About-Games/project/roadmap/'],
    ['CHANGELOG.md', '/Learn-About-Games/project/changelog/'],
  ])('maps public root document %s to its site route', (href, expected) => {
    expect(resolveProjectDocHref(href, 'README.md', base)).toBe(expected);
  });

  it('maps a Devlog Markdown file to its site route', () => {
    expect(
      resolveProjectDocHref('docs/devlog/2026-08-08-project-origin.md', 'README.md', base),
    ).toBe('/Learn-About-Games/devlog/2026-08-08-project-origin/');
  });

  it('normalizes relative repository paths from the source document directory', () => {
    expect(resolveProjectDocHref('../CLAUDE.md', 'docs/guide.md', base)).toBe(
      'https://github.com/PlayWithExperiences/Learn-About-Games/blob/main/CLAUDE.md',
    );
  });

  it('maps other repository Markdown files to an absolute GitHub URL', () => {
    expect(
      resolveProjectDocHref(
        'docs/journal/2026-08-08-learn-about-games-decision-summary.md',
        'README.md',
        base,
      ),
    ).toBe(
      'https://github.com/PlayWithExperiences/Learn-About-Games/blob/main/docs/journal/2026-08-08-learn-about-games-decision-summary.md',
    );
  });
});

describe('rewriteProjectDocLinks', () => {
  it('rewrites anchor hrefs without changing other HTML', () => {
    const html = '<p><a href="ROADMAP.md">Roadmap</a><code>ROADMAP.md</code></p>';

    expect(rewriteProjectDocLinks(html, 'README.md', base)).toBe(
      '<p><a href="/Learn-About-Games/project/roadmap/">Roadmap</a><code>ROADMAP.md</code></p>',
    );
  });
});
