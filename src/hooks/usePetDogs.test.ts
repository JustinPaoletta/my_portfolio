import { act, renderHook, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePetDogs } from './usePetDogs';

const initialDogs = [
  { name: 'Nala', stats: { treats: 0, scritches: 0 } },
  { name: 'Rosie', stats: { treats: 0, scritches: 0 } },
];

describe('usePetDogs', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads initial stats from localStorage', () => {
    localStorage.setItem(
      'pet-dogs-stats',
      JSON.stringify({
        Nala: { treats: 3, scritches: 4 },
      })
    );

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ stats: {} }), { status: 200 })
        )
    );

    const { result } = renderHook(() => usePetDogs(initialDogs));

    expect(result.current[0][0].stats).toEqual({ treats: 3, scritches: 4 });
  });

  it('falls back safely when localStorage has invalid JSON', () => {
    localStorage.setItem('pet-dogs-stats', '{bad json');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ stats: {} }), { status: 200 })
        )
    );

    const { result } = renderHook(() => usePetDogs(initialDogs));

    expect(result.current[0][0].stats).toEqual({ treats: 0, scritches: 0 });
  });

  it('syncs server stats on mount and persists them locally', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            stats: {
              Nala: { treats: 9, scritches: 1 },
              Rosie: { treats: 2, scritches: 8 },
            },
          }),
          { status: 200 }
        )
      )
    );

    const { result } = renderHook(() => usePetDogs(initialDogs));

    await waitFor(() => {
      expect(result.current[0][0].stats.treats).toBe(9);
      expect(result.current[0][1].stats.scritches).toBe(8);
    });

    expect(JSON.parse(localStorage.getItem('pet-dogs-stats') || '{}')).toEqual({
      Nala: { treats: 9, scritches: 1 },
      Rosie: { treats: 2, scritches: 8 },
    });
  });

  it('ignores failed initial GET request and keeps local state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('fail', { status: 500 }))
    );

    const { result } = renderHook(() => usePetDogs(initialDogs));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/pet-dogs',
        expect.objectContaining({ method: 'GET' })
      );
    });

    expect(result.current[0][0].stats).toEqual({ treats: 0, scritches: 0 });
  });

  it('optimistically increments treats and sends treat action to API', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ stats: {} }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => usePetDogs(initialDogs));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    act(() => {
      result.current[1]('Nala', 'treats');
    });

    expect(result.current[0][0].stats.treats).toBe(1);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/pet-dogs',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ dogName: 'Nala', action: 'treat' }),
        })
      );
    });
  });

  it('increments scritches and tolerates POST errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ stats: {} }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response('nope', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => usePetDogs(initialDogs));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current[1]('Rosie', 'scritches');
    });

    expect(result.current[0][1].stats.scritches).toBe(1);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
