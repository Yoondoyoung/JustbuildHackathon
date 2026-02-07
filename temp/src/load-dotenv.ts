/**
 * Loads .env into process.env. Tries (1) project root from this file, (2) cwd.
 * Import this first so config/env sees the values.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

function loadEnvFile(envPath: string): void {
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.replace(/\r$/, '').trim();
    const m = trimmed.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

if (process.env.NODE_ENV !== 'test') {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const projectEnv = resolve(projectRoot, '.env');
  const cwdEnv = resolve(process.cwd(), '.env');
  loadEnvFile(cwdEnv);
  loadEnvFile(projectEnv);
}
