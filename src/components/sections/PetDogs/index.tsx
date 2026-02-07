/**
 * Pet Dogs Section
 * Interactive section to pet my dogs with treats and scritches
 */

import { useRef, useState, useCallback } from 'react';
import { PawPrint } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { usePetDogs } from '@/hooks/usePetDogs';
import { defaultViewport } from '@/utils/animations';
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
    alt: 'Nala, a beautiful Australian Cattle Dog, Australian Shepherd, German Shepherd mix looking happy',
  },
  Rosie: {
    image: '/rosie.webp',
    alt: 'Rosie, a sweet Bloodhound Beagle mix with a gentle expression',
  },
  Tito: {
    image: '/tito.webp',
    alt: 'Tito, a playful Chihuahua Pomeranian Dachshund mix with lots of energy',
  },
};

function PetDogs(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, defaultViewport);
  const [showDogs, setShowDogs] = useState(false);

  const [dogsData, updateStats] = usePetDogs(initialDogsData);

  const dogs: Dog[] = dogsData.map((dogData) => ({
    name: dogData.name,
    ...dogMetadata[dogData.name],
    stats: dogData.stats,
  }));

  const handleTreat = useCallback(
    (dogName: string): void => {
      updateStats(dogName, 'treats');
    },
    [updateStats]
  );

  const handleScritch = useCallback(
    (dogName: string): void => {
      updateStats(dogName, 'scritches');
    },
    [updateStats]
  );

  const toggleDogs = useCallback((): void => {
    setShowDogs((prev) => !prev);
  }, []);

  const [carouselIndex, setCarouselIndex] = useState(0);

  const handlePrev = useCallback((): void => {
    setCarouselIndex((i) => (i === 0 ? dogs.length - 1 : i - 1));
  }, [dogs.length]);

  const handleNext = useCallback((): void => {
    setCarouselIndex((i) => (i === dogs.length - 1 ? 0 : i + 1));
  }, [dogs.length]);

  const currentDog = dogs[carouselIndex];

  return (
    <section
      ref={sectionRef}
      id="pet-dogs"
      className={`pet-dogs-section ${showDogs ? 'expanded' : 'collapsed'}`}
      aria-labelledby="pet-dogs-heading"
    >
      <div className="section-container">
        <header className="section-header">
          <motion.button
            type="button"
            className="pet-dogs-toggle"
            onClick={toggleDogs}
            aria-expanded={showDogs}
            aria-controls="dogs-content"
            aria-label={showDogs ? 'Hide dogs' : 'Show dogs'}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <PawPrint className="pet-dogs-icon" aria-hidden="true" />
            Can I Pet That Dawg?
          </motion.button>
        </header>

        {showDogs && (
          <div id="dogs-content" className="dogs-content">
            <p id="pet-dogs-heading" className="dogs-description">
              <strong>Sure you can!</strong> Meet my 3 rescue dogs{' '}
              <strong>Nala</strong>, <strong>Rosie</strong>, and{' '}
              <strong>Tito</strong>, give them all the virtual love ya got.
            </p>

            {/* Desktop: 3-column grid */}
            <div className="dogs-grid">
              {dogs.map((dog) => (
                <article key={dog.name} className="dog-card">
                  <div className="dog-image-wrapper">
                    <img
                      src={dog.image}
                      alt={dog.alt}
                      className="dog-image"
                      width={120}
                      height={120}
                    />
                  </div>
                  <div className="dog-name-row">
                    <h3 className="dog-name">{dog.name}</h3>
                    {dog.name === 'Nala' && (
                      <span className="dog-badge" role="status">
                        Foster
                      </span>
                    )}
                  </div>
                  <div className="dog-stats">
                    <span aria-label={`Treats: ${dog.stats.treats}`}>
                      🦴 {dog.stats.treats}
                    </span>
                    <span aria-label={`Scritches: ${dog.stats.scritches}`}>
                      ✋ {dog.stats.scritches}
                    </span>
                  </div>
                  <div className="dog-actions">
                    <button
                      type="button"
                      onClick={() => handleTreat(dog.name)}
                      aria-label={`Give ${dog.name} a treat`}
                    >
                      Give a Treat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScritch(dog.name)}
                      aria-label={`Give ${dog.name} some scritches`}
                    >
                      Give Scritches
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile: carousel with single card and nav buttons */}
            <div className="dogs-carousel">
              <button
                type="button"
                className="carousel-btn carousel-prev"
                onClick={handlePrev}
                aria-label="Previous dog"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden={true}
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              {currentDog && (
                <article className="dog-card">
                  <div className="dog-image-wrapper">
                    <img
                      src={currentDog.image}
                      alt={currentDog.alt}
                      width={120}
                      height={120}
                    />
                  </div>
                  <div className="dog-name-row">
                    <h3 className="dog-name">{currentDog.name}</h3>
                    {currentDog.name === 'Nala' && (
                      <span className="dog-badge" role="status">
                        Foster
                      </span>
                    )}
                  </div>
                  <div className="dog-stats">
                    <span aria-label={`Treats: ${currentDog.stats.treats}`}>
                      🦴 {currentDog.stats.treats}
                    </span>
                    <span
                      aria-label={`Scritches: ${currentDog.stats.scritches}`}
                    >
                      ✋ {currentDog.stats.scritches}
                    </span>
                  </div>
                  <div className="dog-actions">
                    <button
                      type="button"
                      onClick={() => handleTreat(currentDog.name)}
                      aria-label={`Give ${currentDog.name} a treat`}
                    >
                      Give a Treat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScritch(currentDog.name)}
                      aria-label={`Give ${currentDog.name} some scritches`}
                    >
                      Give Scritches
                    </button>
                  </div>
                </article>
              )}
              <button
                type="button"
                className="carousel-btn carousel-next"
                onClick={handleNext}
                aria-label="Next dog"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden={true}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default PetDogs;
