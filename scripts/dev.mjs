#!/usr/bin/env node
/*
 * Quadly dev orchestrator.
 * - `node scripts/dev.mjs` (root): starts backend (:4000) + frontend (:5173).
 * - `node scripts/dev.mjs --backend-only`: only the backend (used by the
 *   frontend's `predev` hook so `npm run dev` from frontend/ also starts it).
 * Hits /api/health first: a healthy backend is left untouched.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'frontend');
const backendOnly = process.argv.includes('--backend-only');
const children = [];

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function spawnIn(dir, args, label, color) {
  const child = spawn(npmCmd, args, { cwd: dir, env: process.env });
  const tag = `\x1b[${color}m[${label}]\x1b[0m`;
  const pipe = (stream) =>
    stream.on('data', (chunk) => process.stdout.write(chunk.toString().split('\n').map((l) => (l ? `${tag} ${l}` : l)).join('\n')));
  child.stdout && pipe(child.stdout);
  child.stderr && pipe(child.stderr);
  child.on('exit', (code) => {
    process.stdout.write(`${tag} exited (${code})\n`);
    if (!backendOnly) process.exit(code ?? 0);
  });
  children.push(child);
  return child;
}

async function healthy() {
  try {
    const res = await fetch('http://localhost:4000/api/health', { signal: AbortSignal.timeout(1200) });
    return res.ok;
  } catch {
    return false;
  }
}

const backendUp = await healthy();
if (backendUp) {
  process.stdout.write('[dev] backend already running on :4000 — leaving it alone\n');
} else {
  spawnIn(backendDir, ['start'], 'backend', '36');
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    if (await healthy()) {
      process.stdout.write('[dev] backend healthy on :4000\n');
      break;
    }
  }
}

if (!backendOnly) {
  spawnIn(frontendDir, ['run', 'dev'], 'frontend', '34');
}

function shutdown() {
  for (const c of children) c.kill('SIGINT');
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
