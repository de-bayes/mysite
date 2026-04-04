/**
 * Build a multi-resolution .ico from PNG files (PNG-embedded ICO, Windows Vista+).
 * Usage: node scripts/pngs-to-ico.mjs out.ico a.png b.png ...
 */
import fs from 'node:fs';

function pngDimensions(buf) {
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('Not a PNG buffer');
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  let dataOffset = 6 + count * 16;

  for (const png of pngBuffers) {
    const { width, height } = pngDimensions(png);
    const entry = Buffer.alloc(16);
    // Width/height: one byte each; 0 encodes 256.
    entry[0] = width >= 256 ? 0 : width;
    entry[1] = height >= 256 ? 0 : height;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(dataOffset, 12);
    entries.push(entry);
    dataOffset += png.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

const [, , outPath, ...inputs] = process.argv;
if (!outPath || inputs.length === 0) {
  console.error('Usage: node scripts/pngs-to-ico.mjs out.ico a.png [b.png ...]');
  process.exit(1);
}

const pngs = inputs.map((p) => fs.readFileSync(p));
fs.writeFileSync(outPath, buildIco(pngs));
