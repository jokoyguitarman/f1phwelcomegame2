/**
 * Generates Zoom Spy stage images from YOUR source photos.
 *
 * 1. Put one image per question in: client/public/images/zoom-spy/source/
 *    Name them: q1.jpg, q2.jpg, q3.jpg, q4.jpg, q5.jpg, q6.jpg
 *    (or .png / .jpeg). Any size or aspect ratio is fine.
 *
 * 2. Run from server folder: npm run generate-zoom-spy
 *
 * This creates 5 zoom stages per image (stage1 = most zoomed … stage5 = full)
 * in client/public/images/zoom-spy/q1/ … q6/.
 *
 * Requires: sharp (npm install in server folder)
 */

import sharp from 'sharp';
import { mkdir, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIR = path.join(ROOT, 'client', 'public', 'images', 'zoom-spy', 'source');
const OUT_BASE = path.join(ROOT, 'client', 'public', 'images', 'zoom-spy');
const OUTPUT_SIZE = 800;
const ZOOM_LEVELS = [20, 40, 60, 80, 100]; // % of frame to crop (stage1=zoomed in, stage5=full)

async function getSourcePaths() {
  await mkdir(SOURCE_DIR, { recursive: true });
  const names = await readdir(SOURCE_DIR);
  const list = [];
  for (const name of names) {
    const m = name.match(/^q(\d+)\.(jpg|jpeg|png|webp)$/i);
    if (m) list.push({ num: parseInt(m[1], 10), path: path.join(SOURCE_DIR, name) });
  }
  return list.sort((a, b) => a.num - b.num);
}

async function generateOneSet(questionNum, sourcePath) {
  const qDir = path.join(OUT_BASE, `q${questionNum}`);
  await mkdir(qDir, { recursive: true });

  const img = sharp(sourcePath);
  const meta = await img.metadata();
  const w = meta.width || 1200;
  const h = meta.height || 1200;

  for (let s = 0; s < ZOOM_LEVELS.length; s++) {
    const pct = ZOOM_LEVELS[s] / 100;
    const cropW = Math.max(1, Math.round(w * pct));
    const cropH = Math.max(1, Math.round(h * pct));
    const left = Math.round((w - cropW) / 2);
    const top = Math.round((h - cropH) / 2);

    const outPath = path.join(qDir, `stage${s + 1}.jpg`);
    await img
      .clone()
      .extract({ left, top, width: cropW, height: cropH })
      .resize(OUTPUT_SIZE, OUTPUT_SIZE)
      .jpeg({ quality: 85 })
      .toFile(outPath);
    console.log(`  stage${s + 1}.jpg`);
  }
}

async function main() {
  const sources = await getSourcePaths();
  if (sources.length === 0) {
    console.log('No source images found.');
    console.log(`Add images to: ${SOURCE_DIR}`);
    console.log('Names: q1.jpg, q2.jpg, q3.jpg, q4.jpg, q5.jpg, q6.jpg (or .png)');
    process.exit(1);
  }

  console.log(`Zoom Spy: generating stages from ${sources.length} source image(s)\n`);
  for (const { num, path: sourcePath } of sources) {
    console.log(`q${num}...`);
    await generateOneSet(num, sourcePath);
  }
  const maxQ = Math.max(...sources.map((s) => s.num));
  console.log('\nDone. Output in client/public/images/zoom-spy/q1..q' + maxQ);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
