import { type FullConfig } from '@playwright/test';
import { cleanupBackendState } from './setup/backendSetup.js';

export default async function globalTeardown(config: FullConfig): Promise<void> {
  await cleanupBackendState();
}
