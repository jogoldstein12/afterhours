import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCommit, feedbackEnabled, sendPromptFeedback } from './feedback';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const enable = () => {
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'proj';
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'key';
};
const disable = () => {
  delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
};

describe('feedbackEnabled', () => {
  it('is off unless both the project id and the api key are set', () => {
    disable();
    expect(feedbackEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'proj';
    expect(feedbackEnabled()).toBe(false); // key still missing
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'key';
    expect(feedbackEnabled()).toBe(true);
  });
});

describe('buildCommit', () => {
  it('targets the promptStats doc and increments the given field by one', () => {
    const commit = buildCommit('proj', 7, 'up');
    expect(commit.writes[0].update.name).toBe(
      'projects/proj/databases/(default)/documents/promptStats/7',
    );
    expect(commit.writes[0].updateTransforms[0]).toEqual({
      fieldPath: 'up',
      increment: { integerValue: '1' },
    });
  });
});

describe('sendPromptFeedback', () => {
  it('does nothing, and never fetches, when feedback is not configured', () => {
    disable();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    sendPromptFeedback(42, 'up');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs an increment to the Firestore commit endpoint when configured', () => {
    enable();
    const fetchMock = vi.fn(() => Promise.resolve({}));
    vi.stubGlobal('fetch', fetchMock);

    sendPromptFeedback(42, 'down');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('https://firestore.googleapis.com');
    expect(url).toContain('documents:commit?key=key');
    const body = JSON.parse(init.body as string);
    expect(body.writes[0].update.name).toContain('promptStats/42');
    expect(body.writes[0].updateTransforms[0].fieldPath).toBe('down');
  });

  it('ignores a non-integer prompt id', () => {
    enable();
    const fetchMock = vi.fn(() => Promise.resolve({}));
    vi.stubGlobal('fetch', fetchMock);
    sendPromptFeedback(1.5, 'up');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('swallows a fetch that throws, so a vote never reaches play', () => {
    enable();
    vi.stubGlobal('fetch', () => { throw new Error('blocked'); });
    expect(() => sendPromptFeedback(1, 'up')).not.toThrow();
  });
});
