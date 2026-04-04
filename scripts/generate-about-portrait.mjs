#!/usr/bin/env node
/**
 * Build responsive WebP + full-width JPEG for the About hero from one source image.
 * Usage: node scripts/generate-about-portrait.mjs <input.jpg|png|...>
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/generate-about-portrait.mjs <input-image>');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'images', 'portraits');
const stem = 'about-portrait-5097';
const resizeOpts = { fit: 'inside', withoutEnlargement: true };

for (const w of [600, 1200]) {
  const name = `${stem}-${w}.webp`;
  await sharp(input)
    .rotate()
    .resize(w, null, resizeOpts)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(outDir, name));
  console.error('wrote', name);
}

await sharp(input)
  .rotate()
  .resize(1920, null, resizeOpts)
  .webp({ quality: 90, effort: 6 })
  .toFile(path.join(outDir, `${stem}.webp`));
console.error('wrote', `${stem}.webp`);

await sharp(input)
  .rotate()
  .resize(1920, null, resizeOpts)
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(path.join(outDir, `${stem}.jpg`));
console.error('wrote', `${stem}.jpg`);
