import { describe, expect, it } from 'vitest';

import {
  EMPTY_PROGRESS_STORE,
  PROGRESS_STORAGE_KEY,
  parseProgressStore,
} from '../../src/lib/progress';

describe('progress store', () => {
  it('uses the fixed versioned storage key', () => {
    expect(PROGRESS_STORAGE_KEY).toBe('learn-about-games:progress:v1');
  });

  it('returns an empty version-one store without stored data', () => {
    expect(parseProgressStore(null)).toEqual(EMPTY_PROGRESS_STORE);
  });

  it('returns an empty version-one store for corrupt JSON', () => {
    expect(parseProgressStore('{not-json')).toEqual(EMPTY_PROGRESS_STORE);
  });

  it('returns an empty version-one store for an incompatible version', () => {
    expect(
      parseProgressStore(
        JSON.stringify({
          version: 2,
          capabilities: {
            playtesting: 'practiced',
          },
        }),
      ),
    ).toEqual(EMPTY_PROGRESS_STORE);
  });

  it('preserves valid saved states', () => {
    expect(
      parseProgressStore(
        JSON.stringify({
          version: 1,
          capabilities: {
            playtesting: 'practiced',
            'core-loop': 'used-in-project',
          },
        }),
      ),
    ).toEqual({
      version: 1,
      capabilities: {
        playtesting: 'practiced',
        'core-loop': 'used-in-project',
      },
    });
  });
});
