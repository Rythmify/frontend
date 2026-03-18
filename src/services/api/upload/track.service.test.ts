import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { trackHandlers } from '../../mocks/handlers/trackHandlers';
import {
  uploadTrack,
  getMyTracks,
  getTrack,
  updateTrack,
  deleteTrack,
  setTrackVisibility,
} from './track.service';

// ─── MSW Node Server ──────────────────────────────────────────────────────────

const server = setupServer(...trackHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── uploadTrack() ────────────────────────────────────────────────────────────

describe('uploadTrack()', () => {
  it('returns a track with status "processing" on success', async () => {
    const fakeAudio = new File(['audio-data'], 'track.wav', { type: 'audio/wav' });
    const result = await uploadTrack({ audio_file: fakeAudio, title: 'Summer Vibes' });

    expect(result.data.title).toBe('Summer Vibes');
    expect(result.data.status).toBe('processing');
    // stream_url is null until transcoding finishes
    expect(result.data.stream_url).toBeNull();
    expect(result.message).toBeTruthy();
  });

  it('accepts a Blob (recorded audio) and wraps it as a File', async () => {
    const fakeBlob = new Blob(['audio-data'], { type: 'audio/wav' });
    const result = await uploadTrack({ audio_file: fakeBlob, title: 'Recorded Audio' });

    expect(result.data.title).toBe('Recorded Audio');
    expect(result.data.status).toBe('processing');
  });

  it('reflects the title sent in the form data', async () => {
    const fakeAudio = new File(['audio-data'], 'track.wav', { type: 'audio/wav' });
    const result = await uploadTrack({ audio_file: fakeAudio, title: 'My Custom Title' });

    expect(result.data.title).toBe('My Custom Title');
  });

  it('throws on 413 — file too large', async () => {
    server.use(
      http.post('*/tracks', () =>
        HttpResponse.json(
          { error: { code: 'UPLOAD_FILE_TOO_LARGE', message: 'File size exceeds the allowed limit' } },
          { status: 413 }
        )
      )
    );
    const fakeAudio = new File(['audio-data'], 'huge.wav', { type: 'audio/wav' });
    await expect(uploadTrack({ audio_file: fakeAudio, title: 'Too Big' })).rejects.toThrow();
  });

  it('throws on 415 — unsupported file format', async () => {
    server.use(
      http.post('*/tracks', () =>
        HttpResponse.json(
          { error: { code: 'UPLOAD_INVALID_FILE_TYPE', message: 'Unsupported file format' } },
          { status: 415 }
        )
      )
    );
    const fakeAudio = new File(['audio-data'], 'track.mp4', { type: 'video/mp4' });
    await expect(uploadTrack({ audio_file: fakeAudio, title: 'Wrong Format' })).rejects.toThrow();
  });

  it('throws on 401 — missing or invalid token', async () => {
    server.use(
      http.post('*/tracks', () =>
        HttpResponse.json(
          { error: { code: 'AUTH_TOKEN_MISSING', message: 'Authorization header missing' } },
          { status: 401 }
        )
      )
    );
    const fakeAudio = new File(['audio-data'], 'track.wav', { type: 'audio/wav' });
    await expect(uploadTrack({ audio_file: fakeAudio, title: 'Unauthorized' })).rejects.toThrow();
  });

  it('throws on 403 — upload limit reached', async () => {
    server.use(
      http.post('*/tracks', () =>
        HttpResponse.json(
          { error: { code: 'PERMISSION_DENIED', message: 'Hourly upload limit reached' } },
          { status: 403 }
        )
      )
    );
    const fakeAudio = new File(['audio-data'], 'track.wav', { type: 'audio/wav' });
    await expect(uploadTrack({ audio_file: fakeAudio, title: 'Rate Limited' })).rejects.toThrow();
  });

  it('throws on 500 — server error', async () => {
    server.use(
      http.post('*/tracks', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
          { status: 500 }
        )
      )
    );
    const fakeAudio = new File(['audio-data'], 'track.wav', { type: 'audio/wav' });
    await expect(uploadTrack({ audio_file: fakeAudio, title: 'Server Error' })).rejects.toThrow();
  });
});

// ─── getMyTracks() ────────────────────────────────────────────────────────────

describe('getMyTracks()', () => {
  it('returns a paginated list of the user\'s tracks', async () => {
    const result = await getMyTracks();

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.pagination).toBeDefined();
    expect(result.pagination.page).toBe(1);
  });

  it('throws on 401 — unauthenticated', async () => {
    server.use(
      http.get('*/tracks/me', () =>
        HttpResponse.json(
          { error: { code: 'AUTH_TOKEN_MISSING', message: 'Authorization header missing' } },
          { status: 401 }
        )
      )
    );
    await expect(getMyTracks()).rejects.toThrow();
  });
});

// ─── getTrack() ───────────────────────────────────────────────────────────────

describe('getTrack()', () => {
  it('returns a full track object for a valid ID', async () => {
    const result = await getTrack('e5f6a7b8-c9d0-1234-efab-567890abcdef');

    expect(result.data.id).toBe('e5f6a7b8-c9d0-1234-efab-567890abcdef');
    expect(result.data.status).toBe('ready');
    // stream_url is populated for ready tracks
    expect(result.data.stream_url).toBeTruthy();
  });

  it('throws on 404 — track not found', async () => {
    server.use(
      http.get('*/tracks/:track_id', () =>
        HttpResponse.json(
          { error: { code: 'RESOURCE_NOT_FOUND', message: 'Resource not found.' } },
          { status: 404 }
        )
      )
    );
    await expect(getTrack('non-existent-id')).rejects.toThrow();
  });

  it('throws on 403 — private track accessed by non-owner', async () => {
    server.use(
      http.get('*/tracks/:track_id', () =>
        HttpResponse.json(
          { error: { code: 'RESOURCE_PRIVATE', message: 'This track is private.' } },
          { status: 403 }
        )
      )
    );
    await expect(getTrack('private-track-id')).rejects.toThrow();
  });
});

// ─── updateTrack() ────────────────────────────────────────────────────────────

describe('updateTrack()', () => {
  it('returns updated track on success', async () => {
    const result = await updateTrack('e5f6a7b8-c9d0-1234-efab-567890abcdef', {
      title: 'Summer Vibes (Remastered)',
    });

    expect(result.data.title).toBe('Summer Vibes (Remastered)');
    expect(result.message).toBeTruthy();
  });

  it('throws on 401 — unauthenticated', async () => {
    server.use(
      http.patch('*/tracks/:track_id', () =>
        HttpResponse.json(
          { error: { code: 'AUTH_TOKEN_MISSING', message: 'Authorization header missing' } },
          { status: 401 }
        )
      )
    );
    await expect(
      updateTrack('e5f6a7b8-c9d0-1234-efab-567890abcdef', { title: 'New Title' })
    ).rejects.toThrow();
  });
});

// ─── deleteTrack() ────────────────────────────────────────────────────────────

describe('deleteTrack()', () => {
  it('returns success true on deletion', async () => {
    const result = await deleteTrack('e5f6a7b8-c9d0-1234-efab-567890abcdef');
    expect(result.data.success).toBe(true);
  });

  it('throws on 404 — track not found', async () => {
    server.use(
      http.delete('*/tracks/:track_id', () =>
        HttpResponse.json(
          { error: { code: 'RESOURCE_NOT_FOUND', message: 'Resource not found.' } },
          { status: 404 }
        )
      )
    );
    await expect(deleteTrack('non-existent-id')).rejects.toThrow();
  });
});

// ─── setTrackVisibility() ─────────────────────────────────────────────────────

describe('setTrackVisibility()', () => {
  it('sets track to private successfully', async () => {
    const result = await setTrackVisibility('e5f6a7b8-c9d0-1234-efab-567890abcdef', false);
    expect(result.data.success).toBe(true);
  });

  it('sets track to public successfully', async () => {
    const result = await setTrackVisibility('e5f6a7b8-c9d0-1234-efab-567890abcdef', true);
    expect(result.data.success).toBe(true);
  });

  it('throws on 401 — unauthenticated', async () => {
    server.use(
      http.patch('*/tracks/:track_id/visibility', () =>
        HttpResponse.json(
          { error: { code: 'AUTH_TOKEN_MISSING', message: 'Authorization header missing' } },
          { status: 401 }
        )
      )
    );
    await expect(
      setTrackVisibility('e5f6a7b8-c9d0-1234-efab-567890abcdef', false)
    ).rejects.toThrow();
  });
});
