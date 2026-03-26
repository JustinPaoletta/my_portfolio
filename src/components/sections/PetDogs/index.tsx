/**
 * Pet Dogs Section
 * Interactive section to give treats and scritches to my dogs
 */

import { useRef, useState, useCallback } from 'react';
import { Bone, Hand, PawPrint } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { usePetDogs } from '@/hooks/usePetDogs';
import { defaultViewport } from '@/utils/animations';
import { isVisualTestMode } from '@/utils/visualTest';
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
    image: '/images/pets/nala.webp',
    alt: 'Nala, a beautiful Australian Cattle Dog, Australian Shepherd, German Shepherd mix looking happy',
  },
  Rosie: {
    image: '/images/pets/rosie.webp',
    alt: 'Rosie, a sweet Bloodhound Beagle mix with a gentle expression',
  },
  Tito: {
    image: '/images/pets/tito.webp',
    alt: 'Tito, a playful Chihuahua Pomeranian Dachshund mix with lots of energy',
  },
};

function PetDogs(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisualTest = isVisualTestMode();
  const sectionInView = useInView(sectionRef, defaultViewport);
  const isInView = isVisualTest || sectionInView;
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
            <div className="dogs-list">
              {dogs.map((dog) => (
                <article key={dog.name} className="dog-row">
                  <div className="dog-avatar-shell">
                    <img
                      src={dog.image}
                      alt={dog.alt}
                      className="dog-avatar"
                      width={90}
                      height={90}
                    />
                    {dog.name === 'Nala' && (
                      <span className="dog-badge-overlay" role="status">
                        Foster
                      </span>
                    )}
                  </div>

                  <div className="dog-row-main">
                    <div className="dog-name-row">
                      <h3 className="dog-name">{dog.name}</h3>
                    </div>

                    <div className="dog-counter-actions">
                      <button
                        type="button"
                        className="dog-counter-button"
                        onClick={() => handleTreat(dog.name)}
                        aria-label={`Give ${dog.name} a treat. Current treats: ${dog.stats.treats}`}
                      >
                        <Bone className="dog-stat-icon" aria-hidden="true" />
                        <span className="dog-counter-value">
                          {dog.stats.treats}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="dog-counter-button"
                        onClick={() => handleScritch(dog.name)}
                        aria-label={`Give ${dog.name} some scritches. Current scritches: ${dog.stats.scritches}`}
                      >
                        <Hand className="dog-stat-icon" aria-hidden="true" />
                        <span className="dog-counter-value">
                          {dog.stats.scritches}
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default PetDogs;
