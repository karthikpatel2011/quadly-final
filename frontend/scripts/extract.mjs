// Sample exact pixel colors from the reference screenshot at known points.
// Usage: node scripts/extract.mjs
import sharp from 'sharp';

const SRC = './scripts/source.jpeg';
const POINTS = [
  ['nav_bg', 700, 40],
  ['nav_cta_blue', 1345, 33],
  ['ph_badge_logo', 232, 193],
  ['hero_blue_top', 700, 130],
  ['hero_blue_mid', 700, 500],
  ['hero_blue_low', 60, 900],
  ['hero_blue_bottom', 700, 1150],
  ['hero_btn_dark', 1110, 393],
  ['editor_bg', 700, 700],
  ['editor_panel', 200, 855],
  ['cards_bg', 400, 1950],
  ['page_bg', 700, 2350],
  ['narr_blue', 700, 2600],
  ['narr_wave', 150, 2885],
  ['narr_streak', 1320, 2900],
  ['chip_orange', 263, 3668],
  ['chip_green', 545, 3689],
  ['chip_green2', 905, 3700],
  ['chip_music_orange', 262, 3798],
  ['chip_yellow', 705, 3795],
  ['chip_blue', 1146, 3795],
  ['chip_purple', 402, 3878],
  ['chip_sky', 706, 3878],
  ['chip_pink', 1147, 3878],
  ['backed_bg_top', 700, 3960],
  ['backed_bg_low', 700, 4400],
  ['cta_blue_left', 350, 4650],
  ['cta_blue_right', 1050, 4650],
  ['footer_3d_blue', 400, 5620],
  ['footer_3d_hi', 400, 5560],
];

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => {
  const i = (y * info.width + x) * info.channels;
  return '#' + [data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
};

for (const [name, x, y] of POINTS) console.log(name.padEnd(18), px(x, y));
