/**
 * Pet Dogs Section
 * Interactive section to pet my dogs with treats and scritches
 * Uses Framer Motion for smooth scroll animations
 */

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { usePetDogs } from '@/hooks/usePetDogs';
import {
  fadeUpVariants,
  staggerContainerVariants,
  defaultViewport,
} from '@/utils/animations';
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
      className={`pet-dogs-section ${showDogs ? 'expanded' : 'collapsed'}`}
      aria-labelledby="pet-dogs-heading"
    >
      <div className="section-container">
        <motion.header
          className="section-header"
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <button
            type="button"
            className="pet-dogs-toggle"
            onClick={toggleDogs}
            aria-expanded={showDogs}
            aria-controls="dogs-content"
            aria-label={showDogs ? 'Hide dogs' : 'Show dogs'}
          >
            <span className="section-label">Can I Pet That Dawg?</span>
          </button>
          <AnimatePresence mode="wait">
            {showDogs && (
              <motion.p
                id="pet-dogs-heading"
                className="section-description"
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <strong>You sure can!</strong> Meet my 3 rescue dogs{' '}
                <strong>Nala</strong>, <strong>Rosie</strong>, and{' '}
                <strong>Tito</strong>, give them all the virtual love ya got.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.header>

        <AnimatePresence mode="wait">
          {showDogs && (
            <motion.div
              id="dogs-content"
              className="dogs-grid"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              {dogs.map((dog) => (
                <motion.article
                  key={dog.name}
                  className="dog-card"
                  variants={fadeUpVariants}
                  layout
                >
                  {dog.name === 'Nala' && (
                    <div className="foster-banner" role="status">
                      Foster Dog
                    </div>
                  )}
                  <div className="dog-image-container">
                    <img
                      src={dog.image}
                      alt={dog.alt}
                      className="dog-image"
                      width={120}
                      height={120}
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
                        <span className="stat-count">
                          {dog.stats.scritches}
                        </span>
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
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default PetDogs;
