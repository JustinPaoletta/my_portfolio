import type { AppConfig } from './app-config';

export const env = __APP_CONFIG__;

export type Env = typeof env;
export type ValidatedEnv = AppConfig;
