/**
 * Suspense fallback for lazy portfolio sections: reserves layout and exposes
 * a polite busy region while the code-split chunk loads.
 */

import type { ReactElement } from 'react';
import './SectionRouteFallback.css';

function formatSectionLabel(sectionId: string): string {
  if (sectionId === 'pet-dogs') {
    return 'Pet dogs';
  }

  return sectionId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface SectionRouteFallbackProps {
  sectionId: string;
}

export function SectionRouteFallback({
  sectionId,
}: SectionRouteFallbackProps): ReactElement {
  const label = formatSectionLabel(sectionId);

  return (
    <div
      className="section-route-fallback"
      data-section-route-fallback=""
      data-section-id={sectionId}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={`Loading ${label} section`}
    >
      <span className="visually-hidden">Loading {label} section</span>
    </div>
  );
}

export default SectionRouteFallback;
