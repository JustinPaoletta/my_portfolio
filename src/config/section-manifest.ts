import { lazy, type LazyExoticComponent } from 'react';

type SectionActivationMode = 'idle' | 'deferred';

interface SectionManifestItem {
  id:
    | 'about'
    | 'projects'
    | 'articles'
    | 'experience'
    | 'skills'
    | 'github'
    | 'contact'
    | 'pet-dogs';
  activation: SectionActivationMode;
  Component: LazyExoticComponent<() => React.ReactElement>;
  rootMargin?: string;
}

export const SECTION_MANIFEST: SectionManifestItem[] = [
  {
    id: 'projects',
    activation: 'idle',
    Component: lazy(() => import('@/components/sections/Projects')),
  },
  {
    id: 'experience',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/Experience')),
  },
  {
    id: 'about',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/About')),
  },
  {
    id: 'skills',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/Skills')),
  },
  {
    id: 'articles',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/Articles')),
  },
  {
    id: 'contact',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/Contact')),
  },
  {
    id: 'github',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/GitHub')),
  },
  {
    id: 'pet-dogs',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/PetDogs')),
  },
];
