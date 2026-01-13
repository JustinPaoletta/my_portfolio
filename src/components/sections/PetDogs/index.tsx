/**
 * Pet Dogs Section
 * Interactive section to pet my dogs with treats and scritches
 */

import { useRef, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { usePetDogs } from '@/hooks/usePetDogs';
import './PetDogs.css';

interface DogStats {
  treats: number;
  scritches: number;
}

interface Dog {
  name: string;
  image: string;
  alt: string;
  stats: DogStats;
}

const initialDogsData = [
  { name: 'Nala', stats: { treats: 0, scritches: 0 } },
  { name: 'Rosie', stats: { treats: 0, scritches: 0 } },
  { name: 'Tito', stats: { treats: 0, scritches: 0 } },
];

const dogMetadata: Record<string, Omit<Dog, 'name' | 'stats'>> = {
  Nala: {
    image: '/nala.webp',
    alt: 'Nala, a beautiful golden retriever looking happy',
  },
  Rosie: {
    image: '/rosie.webp',
    alt: 'Rosie, a sweet Australian shepherd with a gentle expression',
  },
  Tito: {
    image: '/tito.webp',
    alt: 'Tito, a playful rescue dog with lots of energy',
  },
};

function PetDogs(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.2 });
  const [showDogs, setShowDogs] = useState(false);

  const [dogsData, updateStats] = usePetDogs(initialDogsData);

  // Merge persisted stats with full dog data (image, alt, etc.)
  const dogs: Dog[] = dogsData.map((dogData) => ({
    name: dogData.name,
    ...dogMetadata[dogData.name],
    stats: dogData.stats,
  }));

  const handleTreat = (dogName: string): void => {
    updateStats(dogName, 'treats');
  };

  const handleScritch = (dogName: string): void => {
    updateStats(dogName, 'scritches');
  };

  const toggleDogs = (): void => {
    setShowDogs((prev) => !prev);
  };

  return (
    <section
      ref={sectionRef}
      id="pet-dogs"
      className={`pet-dogs-section ${isVisible ? 'visible' : ''} ${showDogs ? 'expanded' : 'collapsed'}`}
      aria-labelledby="pet-dogs-heading"
    >
      <div className="section-container">
        <header className="section-header">
          <button
            type="button"
            className="pet-dogs-toggle"
            onClick={toggleDogs}
            aria-expanded={showDogs}
            aria-controls="dogs-content"
            aria-label={showDogs ? 'Hide dogs' : 'Show dogs'}
          >
            <span className="section-label">Can I pet dat dawwgg?</span>
          </button>
          {showDogs && (
            <h2 id="pet-dogs-heading" className="section-title">
              Yes! Give Them Some Love ❤️
            </h2>
          )}
        </header>

        {showDogs && (
          <div id="dogs-content" className="dogs-grid">
            {dogs.map((dog) => (
              <article key={dog.name} className="dog-card">
                <div className="dog-image-container">
                  <img
                    src={dog.image}
                    alt={dog.alt}
                    className="dog-image"
                    width={200}
                    height={200}
                  />
                  <div className="dog-name">{dog.name}</div>
                </div>

                <div className="dog-content">
                  <div className="dog-stats">
                    <div className="stat-item">
                      <span className="stat-label">Treats:</span>
                      <span className="stat-count">{dog.stats.treats}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Scritches:</span>
                      <span className="stat-count">{dog.stats.scritches}</span>
                    </div>
                  </div>

                  <div className="dog-actions">
                    <button
                      type="button"
                      className="action-button treat-button"
                      onClick={() => handleTreat(dog.name)}
                      aria-label={`Give ${dog.name} a treat`}
                    >
                      🦴 Give Treat
                    </button>
                    <button
                      type="button"
                      className="action-button scritch-button"
                      onClick={() => handleScritch(dog.name)}
                      aria-label={`Give ${dog.name} some scritches`}
                    >
                      ✋ Give Scritches
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {showDogs && (
          <div className="pet-dogs-message" role="status" aria-live="polite">
            <p>
              These are my three rescue dogs - Nala (golden retriever), Rosie
              (Australian shepherd), and Tito (mystery mix). They love treats
              and belly rubs! Feel free to give them some virtual love. 🐾
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default PetDogs;
