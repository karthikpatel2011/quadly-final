// Second pass: retargeted points that hit text/art instead of surfaces.
import sharp from 'sharp';

const SRC = './scripts/source.jpeg';
const POINTS = [
  ['nav_cta_left', 1288, 33],
  ['nav_cta_right', 1370, 33],
  ['ph_logo', 222, 194],
  ['editor_canvas_dark', 460, 900],
  ['card_body_bg', 200, 2130],
  ['card_border_left', 110, 2130],
  ['page_gap_bg', 1050, 1740],
  ['narr_blue_a', 700, 2630],
  ['narr_blue_b', 350, 2600],
  ['narr_streak_a', 1200, 2908],
  ['narr_streak_b', 1250, 2890],
  ['chip_orange_top', 263, 3637],
  ['chip_orange_bot', 263, 3700],
  ['chip_purple_a', 310, 3862],
  ['chip_sky_a', 620, 3850],
  ['cta_top', 700, 4600],
  ['cta_bottom', 700, 4720],
];

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => {
  const i = (y * info.width + x) * info.channels;
  return '#' + [data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
};
for (const [name, x, y] of POINTS) console.log(name.padEnd(20), px(x, y));
