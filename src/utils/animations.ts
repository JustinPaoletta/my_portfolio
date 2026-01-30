/**
 * Framer Motion Animation Variants
 * Reusable animation configurations for consistent scroll animations
 */

import type { Variants, Transition } from 'framer-motion';

/**
 * Spring transition for natural, physics-based animations
 */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  mass: 1,
};

/**
 * Smooth ease transition for subtle animations
 */
export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1], // Custom ease curve
};

/**
 * Fade up animation - elements fade in while moving up
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: smoothTransition,
  },
};

/**
 * Fade in from left
 */
export const fadeLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springTransition,
  },
};

/**
 * Fade in from right
 */
export const fadeRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springTransition,
  },
};

/**
 * Scale up animation - elements scale from smaller size
 */
export const scaleUpVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

/**
 * Stagger container - use as parent to stagger children animations
 */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

/**
 * Fast stagger for items like skill tags
 */
export const fastStaggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

/**
 * Section header animation with stagger
 */
export const sectionHeaderVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Default viewport settings for useInView
 * Note: Framer Motion's margin format is different from rootMargin
 */
export const defaultViewport = {
  once: true,
  margin: '-100px 0px -50px 0px' as const,
  amount: 0.1,
};

/**
 * Viewport settings for smaller elements
 */
export const cardViewport = {
  once: true,
  margin: '-50px 0px -50px 0px' as const,
  amount: 0.2,
};
