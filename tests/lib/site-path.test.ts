import { describe, expect, it } from 'vitest';

import { joinBase } from '../../src/lib/site-path';

describe('joinBase', () => {
  it('joins a base path with an empty path', () => {
    expect(joinBase('/Learn-About-Games/', '')).toBe('/Learn-About-Games/');
  });

  it('joins a base path with a slash-delimited path', () => {
    expect(joinBase('/Learn-About-Games/', '/map/')).toBe('/Learn-About-Games/map/');
  });

  it('joins a base path with a relative path', () => {
    expect(joinBase('/Learn-About-Games/', 'resources/')).toBe('/Learn-About-Games/resources/');
  });
});
