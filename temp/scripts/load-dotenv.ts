/**
 * Loads .env from process.cwd() into process.env.
 * Import this first in scripts that need .env (before any code that reads process.env).
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

if (process.env.NODE_ENV !== 'test') {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.replace(/\r$/, '').trim();
      const m = trimmed.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}
