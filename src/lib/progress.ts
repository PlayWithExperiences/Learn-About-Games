export const PROGRESS_STORAGE_KEY = 'learn-about-games:progress:v1';

export const PROGRESS_STATES = [
  'unseen',
  'understood',
  'practiced',
  'used-in-project',
  'can-guide',
] as const;

export type ProgressState = (typeof PROGRESS_STATES)[number];

export type ProgressStore = {
  version: 1;
  capabilities: Record<string, ProgressState>;
};

export const EMPTY_PROGRESS_STORE: ProgressStore = {
  version: 1,
  capabilities: {},
};

export function parseProgressStore(serialized: string | null): ProgressStore {
  if (serialized === null) {
    return { ...EMPTY_PROGRESS_STORE, capabilities: {} };
  }

  try {
    const value: unknown = JSON.parse(serialized);
    if (
      typeof value !== 'object' ||
      value === null ||
      !('version' in value) ||
      value.version !== 1 ||
      !('capabilities' in value) ||
      typeof value.capabilities !== 'object' ||
      value.capabilities === null ||
      Array.isArray(value.capabilities)
    ) {
      return { ...EMPTY_PROGRESS_STORE, capabilities: {} };
    }

    const capabilities = Object.fromEntries(
      Object.entries(value.capabilities).filter(
        (entry): entry is [string, ProgressState] =>
          typeof entry[1] === 'string' && PROGRESS_STATES.includes(entry[1] as ProgressState),
      ),
    );

    return { version: 1, capabilities };
  } catch {
    return { ...EMPTY_PROGRESS_STORE, capabilities: {} };
  }
}
