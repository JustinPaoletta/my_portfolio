import { lazy, type LazyExoticComponent } from 'react';

export type SectionActivationMode = 'idle' | 'deferred';

export interface SectionManifestItem {
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
    id: 'about',
    activation: 'idle',
    Component: lazy(() => import('@/components/sections/About')),
  },
  {
    id: 'projects',
    activation: 'idle',
    Component: lazy(() => import('@/components/sections/Projects')),
  },
  {
    id: 'articles',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/Articles')),
  },
  {
    id: 'experience',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/Experience')),
  },
  {
    id: 'skills',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/Skills')),
  },
  {
    id: 'github',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/GitHub')),
  },
  {
    id: 'contact',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/Contact')),
  },
  {
    id: 'pet-dogs',
    activation: 'deferred',
    Component: lazy(() => import('@/components/sections/PetDogs')),
  },
];
