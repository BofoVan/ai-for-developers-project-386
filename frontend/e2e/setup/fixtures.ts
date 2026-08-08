import { test as base, expect } from '@playwright/test';
import { loadTestEnv } from './testEnv.js';

export const test = base.extend<{
  e2eEnv: Record<string, string>;
}>({
  e2eEnv: async ({}, use) => {
    const env = await loadTestEnv();
    await use(env);
  },
});

export { expect };
