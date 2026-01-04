/**
 * Wrapper for PWA register hook
 * Provides the useRegisterSW hook from vite-plugin-pwa
 */

// Import the hook directly from the virtual module
// This works because PWA plugin is always enabled (including dev mode)
import { useRegisterSW } from 'virtual:pwa-register/react';

export { useRegisterSW };
