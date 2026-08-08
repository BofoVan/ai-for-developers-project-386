import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const envPath = path.resolve(__dirname, '../../.e2e-env.json');

export async function loadTestEnv(): Promise<Record<string, string>> {
  const raw = await fs.readFile(envPath, 'utf-8');
  return JSON.parse(raw) as Record<string, string>;
}
