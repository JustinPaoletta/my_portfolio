import { describe, expect, it, vi } from 'vitest';
const preload = vi.hoisted(() => vi.fn());
vi.mock('@react-three/fiber', () => ({ useLoader: { preload } }));
vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {},
}));
vi.mock('./EngineerCircuit3D', () => ({ default: () => null }));
vi.mock('./CosmicScene3D', () => ({ default: () => null }));
import { preloadRichHeroScene } from './preloadRichHeroScene';

describe('hero model preloading', () => {
  it('deduplicates concurrent requests and remembers completed models', async () => {
    await Promise.all([
      preloadRichHeroScene('engineer'),
      preloadRichHeroScene('engineer'),
    ]);
    expect(preload).toHaveBeenCalledTimes(1);
    expect(preload).toHaveBeenCalledWith(
      expect.any(Function),
      '/models/hero/circuit-board.glb'
    );
    await preloadRichHeroScene('engineer');
    expect(preload).toHaveBeenCalledTimes(1);
  });
  it('retries a rejected preload instead of retaining the failed promise', async () => {
    preload.mockImplementationOnce(() => {
      throw new Error('Unavailable');
    });
    await expect(preloadRichHeroScene('cosmic')).rejects.toThrow('Unavailable');
    await preloadRichHeroScene('cosmic');
    expect(preload).toHaveBeenLastCalledWith(
      expect.any(Function),
      '/models/hero/cosmic-scene.glb'
    );
    expect(preload).toHaveBeenCalledTimes(3);
  });
});
