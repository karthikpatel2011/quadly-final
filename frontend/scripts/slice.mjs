// Slice the reference screenshot into uniform vertical strips for analysis.
// Usage: node scripts/slice.mjs [numSlices]
import sharp from 'sharp';

const SRC = './scripts/source.jpeg';
const OUT_DIR = './scripts/slices';
const N = Number(process.argv[2] || 6);

const meta = await sharp(SRC).metadata();
const stripHeight = Math.ceil(meta.height / N);

console.log(`source: ${meta.width}x${meta.height}, strips: ${N} x ~${stripHeight}px`);

for (let i = 0; i < N; i++) {
  const top = i * stripHeight;
  const height = Math.min(stripHeight, meta.height - top);
  await sharp(SRC)
    .extract({ left: 0, top, width: meta.width, height })
    .png()
    .toFile(`${OUT_DIR}/strip-${i}.png`);
  console.log(`wrote strip-${i}.png (y ${top}–${top + height})`);
}
