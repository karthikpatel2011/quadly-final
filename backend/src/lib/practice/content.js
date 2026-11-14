// Content loader — the only door to the authored scenario/drill/season files.
// Everything loads once and validates against the zod schemas at boot; broken
// content is excluded loudly (a message goes to the server log) so an
// authoring mistake can never break a live incident room.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { scenarioSchema, drillSchema, seasonSchema } from './schema.js';

const DIR = fileURLToPath(new URL('./content/', import.meta.url));

async function loadList(file, schema, label) {
  let raw;
  try {
    raw = JSON.parse(await readFile(DIR + file, 'utf8'));
  } catch (err) {
    console.error(`[practice] could not read ${file}: ${err.message}`);
    return [];
  }
  const list = Array.isArray(raw) ? raw : raw[Object.keys(raw)[0]] || [];
  const ok = [];
  for (const item of list) {
    const parsed = schema.safeParse(item);
    if (parsed.success) ok.push(parsed.data);
    else console.error(`[practice] dropped ${label} "${item?.id}" — ${parsed.error.issues[0]?.message}`);
  }
  return ok;
}

export let scenarios = [];
export let drills = [];
export let seasons = [];

let loaded = false;
export async function ensureContent() {
  if (loaded) return;
  scenarios = await loadList('scenarios.json', scenarioSchema, 'scenario');
  drills = await loadList('drills.json', drillSchema, 'drill');
  seasons = await loadList('seasons.json', seasonSchema, 'season');
  if (scenarios.length === 0) console.error('[practice] WARNING: no playable scenarios loaded');
  if (drills.length === 0) console.error('[practice] WARNING: no drills loaded');
  loaded = true;
}
