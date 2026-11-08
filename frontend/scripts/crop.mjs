// Cut shared art assets (public/art/) and per-section reference crops.
// Usage: node scripts/crop.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = './scripts/source.jpeg';
const meta = await sharp(SRC).metadata();

// Small art pieces reused across sections (kept as real image assets).
const ASSETS = [
  { name: 'narrative-left-streaks', left: 16, top: 2561, width: 404, height: 229 },
  { name: 'narrative-bottom-left', left: 16, top: 2760, width: 454, height: 170 },
  { name: 'narrative-right', left: 1080, top: 2680, width: 304, height: 250 },
  { name: 'caption-photo', left: 881, top: 2253, width: 378, height: 174 },
];

// One crop per sub-agent section (±~10-20px overlap so edges survive the cut).
const SECTIONS = [
  { name: 'hero', top: 0, bottom: 1171 },
  { name: 'workflow', top: 1151, bottom: 2571 },
  { name: 'narrative', top: 2551, bottom: 2940 },
  { name: 'save-hours', top: 2920, bottom: 3945 },
  { name: 'backed-cta', top: 3925, bottom: 4985 },
  { name: 'footer', top: 4965, bottom: 5658 },
];

await mkdir('./public/art', { recursive: true });
await mkdir('./scripts/crops', { recursive: true });

for (const a of ASSETS) {
  await sharp(SRC).extract(a).png().toFile(`./public/art/${a.name}.png`);
  console.log(`asset  public/art/${a.name}.png  ${a.width}x${a.height}`);
}

for (const s of SECTIONS) {
  const height = Math.min(s.bottom, meta.height) - s.top;
  await sharp(SRC).extract({ left: 0, top: s.top, width: meta.width, height }).png().toFile(`./scripts/crops/${s.name}.png`);
  console.log(`crop   scripts/crops/${s.name}.png  ${meta.width}x${height}  (abs y ${s.top}–${s.bottom})`);
}
