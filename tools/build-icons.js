#!/usr/bin/env node
/**
 * Generates every app icon from assets/afterhours-icon.png.
 *
 * The source is a 1254px square whose artwork is a rounded badge inset inside
 * a transparent margin. Each output needs something different from it:
 *
 *   - PWA / apple-touch: full bleed. The badge is cropped out of its margin and
 *     flattened onto the brand background, because iOS composites transparency
 *     onto black and applies its own rounded mask — a pre-inset, pre-rounded
 *     icon ends up looking doubly inset.
 *   - maskable: Android crops adaptive icons to a circle of 80% diameter, so
 *     the artwork is held inside 72% and the rest is brand background.
 *   - favicon: the wordmark is an illegible smear below about 64px, so the ICO
 *     uses the martini glass alone.
 *
 * Run after replacing the source art:  npm run build:icons
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const SRC = path.join(root, 'assets', 'afterhours-icon.png');
const ICONS = path.join(root, 'public', 'icons');
const FAVICON = path.join(root, 'src', 'app', 'favicon.ico');

/** --background from globals.css. */
const BG = { r: 0x0a, g: 0x04, b: 0x0f, alpha: 1 };
/** PNG palette quantisation: ~4x smaller with no visible banding on this art. */
const PNG = { palette: true, colours: 256, dither: 1.0, compressionLevel: 9 };
/** The glass alone, in coordinates of the 512px full-bleed icon. */
const GLASS = { left: 105, top: 45, width: 305, height: 305 };

/** Tightest box containing anything not fully transparent. */
async function opaqueBounds(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** ICO container holding one PNG per size. Understood by every current browser. */
function buildIco(pngs, sizes) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);

  const dir = Buffer.alloc(16 * sizes.length);
  let offset = header.length + dir.length;
  sizes.forEach((size, i) => {
    const o = i * 16;
    dir[o] = size === 256 ? 0 : size;
    dir[o + 1] = size === 256 ? 0 : size;
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(pngs[i].length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += pngs[i].length;
  });
  return Buffer.concat([header, dir, ...pngs]);
}

(async () => {
  const box = await opaqueBounds(SRC);
  // Square it off so nothing is stretched.
  const side = Math.max(box.width, box.height);
  const badge = await sharp(SRC)
    .extract(box)
    .resize(side, side, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const written = [];
  const bleed = async (size, file) => {
    const out = path.join(ICONS, file);
    await sharp(badge).resize(size, size).flatten({ background: BG }).png(PNG).toFile(out);
    written.push(out);
  };
  await bleed(192, 'icon-192x192.png');
  await bleed(512, 'icon-512x512.png');
  await bleed(180, 'apple-touch-icon.png');

  const inner = Math.round(512 * 0.72);
  const pad = Math.round((512 - inner) / 2);
  const maskable = path.join(ICONS, 'icon-maskable-512x512.png');
  await sharp({ create: { width: 512, height: 512, channels: 4, background: BG } })
    .composite([{ input: await sharp(badge).resize(inner, inner).toBuffer(), top: pad, left: pad }])
    .png(PNG)
    .toFile(maskable);
  written.push(maskable);

  const sizes = [16, 32, 48];
  const glass = await sharp(path.join(ICONS, 'icon-512x512.png')).extract(GLASS).toBuffer();
  const pngs = await Promise.all(
    sizes.map((s) => sharp(glass).resize(s, s).flatten({ background: BG }).png({ compressionLevel: 9 }).toBuffer()),
  );
  fs.writeFileSync(FAVICON, buildIco(pngs, sizes));
  written.push(FAVICON);

  for (const file of written) {
    console.log('  ' + path.relative(root, file).padEnd(42) + (fs.statSync(file).size / 1024).toFixed(0) + ' KB');
  }
})();
