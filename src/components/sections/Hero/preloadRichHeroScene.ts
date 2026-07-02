export type RichHeroTheme = 'engineer' | 'cosmic';

const modelByTheme = {
  engineer: '/models/hero/circuit-board.glb',
  cosmic: '/models/hero/cosmic-scene.glb',
} as const;

const preloadedThemes = new Set<RichHeroTheme>();
const preloadingThemes = new Map<RichHeroTheme, Promise<void>>();

export async function preloadRichHeroScene(
  theme: RichHeroTheme
): Promise<void> {
  if (preloadedThemes.has(theme)) {
    return;
  }

  const existingPreload = preloadingThemes.get(theme);
  if (existingPreload) {
    return existingPreload;
  }

  const preloadPromise = (async () => {
    const [{ useLoader }, { GLTFLoader }] = await Promise.all([
      import('@react-three/fiber'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
    ]);

    if (theme === 'engineer') {
      void import('@/components/sections/Hero/EngineerCircuit3D');
    } else {
      void import('@/components/sections/Hero/CosmicScene3D');
    }

    useLoader.preload(GLTFLoader, modelByTheme[theme]);
    preloadedThemes.add(theme);
  })();

  preloadingThemes.set(theme, preloadPromise);

  try {
    await preloadPromise;
  } finally {
    preloadingThemes.delete(theme);
  }
}
