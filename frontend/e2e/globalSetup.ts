import { type FullConfig } from '@playwright/test';
import { setupBackendState } from './setup/backendSetup.js';

export default async function globalSetup(config: FullConfig): Promise<void> {
  await setupBackendState();
}
