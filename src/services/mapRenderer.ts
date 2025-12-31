// src/services/mapRenderer.ts
import { getFileBlob, getFileBuffer, getFile } from './parsers/v2/utils';
import type { FileContent } from './fileReader';

interface LayoutInfo {
  width: number;
  height: number;
  blockdata_filepath: string;
  primary_tileset: string;
  secondary_tileset: string;
}

// --- CONSTANTS ---
const TILE_SIZE = 8;
const META_SIZE = 16;
const PALETTE_COUNT = 16;
// const COLORS_PER_PALETTE = 16;

// --- TYPES ---
type RGB = [number, number, number];
type Palette = RGB[]; // Array of 16 colors

// --- HELPERS ---

function formatTilesetName(symbol: string): string {
  return symbol
    .replace(/^gTileset_/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Parses a standard JASC-PAL text file into an array of [r, g, b]
 */
function parseJascPalette(text: string): Palette {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const colors: Palette = [];

  // Skip headers (JASC-PAL, 0100, 16) - usually starts at line 3
  let startIndex = 0;
  if (lines[0].startsWith('JASC')) startIndex = 3;

  for (let i = startIndex; i < lines.length && colors.length < 16; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 3) {
      colors.push([
        parseInt(parts[0], 10), // R
        parseInt(parts[1], 10), // G
        parseInt(parts[2], 10), // B
      ]);
    }
  }

  // Fill remaining with black if file is short
  while (colors.length < 16) colors.push([0, 0, 0]);
  return colors;
}

/**
 * Loads all 16 palettes.
 * 0-5: Primary (Global)
 * 6-12: Secondary (Local) - Note: standard Emerald uses 6-12, but we load all found.
 */
function loadPalettes(
  files: Map<string, FileContent>,
  primaryName: string,
  secondaryName: string,
): Palette[] {
  const palettes: Palette[] = Array(PALETTE_COUNT).fill(
    Array(16).fill([0, 0, 0]), // Default black
  );

  const loadPal = (folder: string, slot: number, isSecondary: boolean) => {
    // Try to find the file. Valid names: "00.pal", "0.pal", "06.pal"
    const candidates = [String(slot).padStart(2, '0') + '.pal', String(slot) + '.pal'];

    // Primary path vs Secondary path
    const basePath = isSecondary
      ? `data/tilesets/secondary/${folder}/palettes/`
      : `data/tilesets/primary/${folder}/palettes/`;

    for (const filename of candidates) {
      const content = getFile(files, basePath + filename);
      if (content && typeof content === 'string') {
        palettes[slot] = parseJascPalette(content);
        return;
      }
    }
  };

  // 1. Load Primary (Slots 0-5 usually, but we check 0-15)
  for (let i = 0; i < PALETTE_COUNT; i++) loadPal(primaryName, i, false);

  // 2. Load Secondary (Slots 6-15 usually) - Overwrites primary if they share slots
  for (let i = 0; i < PALETTE_COUNT; i++) loadPal(secondaryName, i, true);

  return palettes;
}

/**
 * Extracts raw pixel data from an image and creates a map of "Color String" -> "Index"
 * This allows us to map the grayscale PNG colors back to 0-15 indices.
 */
async function getImageDataAndIndexMap(
  blob: Blob,
): Promise<{ data: Uint8ClampedArray; width: number; indexMap: Map<string, number> } | null> {
  const img = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const raw = ctx.getImageData(0, 0, img.width, img.height);

  // Build Index Map: Scan image, find unique colors, sort by brightness (standard decomp behavior)
  const uniqueColors = new Set<string>();
  for (let i = 0; i < raw.data.length; i += 4) {
    // Create key "R,G,B"
    const key = `${raw.data[i]},${raw.data[i + 1]},${raw.data[i + 2]}`;
    uniqueColors.add(key);
  }

  // Sort colors. In decomp grayscale: Black (0,0,0) is index 0. White is index 15.
  const sortedColors = Array.from(uniqueColors).sort((a, b) => {
    const [r1] = a.split(',').map(Number);
    const [r2] = b.split(',').map(Number);
    return r1 - r2; // Sort by Red channel (intensity)
  });

  const indexMap = new Map<string, number>();
  sortedColors.forEach((color, idx) => {
    if (idx < 16) indexMap.set(color, idx);
  });

  return { data: raw.data, width: img.width, indexMap };
}

// --- MAIN FUNCTION ---

export async function generateMapImage(
  layout: LayoutInfo,
  files: Map<string, FileContent>,
): Promise<string | null> {
  const primaryName = formatTilesetName(layout.primary_tileset);
  const secondaryName = formatTilesetName(layout.secondary_tileset);

  // 1. Load Binary Data
  const mapBuffer = getFileBuffer(files, layout.blockdata_filepath);
  const primMetaBuffer = getFileBuffer(files, `data/tilesets/primary/${primaryName}/metatiles.bin`);
  const secMetaBuffer = getFileBuffer(
    files,
    `data/tilesets/secondary/${secondaryName}/metatiles.bin`,
  );

  // 2. Load Image Blobs
  const primBlob = getFileBlob(files, `data/tilesets/primary/${primaryName}/tiles.png`);
  const secBlob = getFileBlob(files, `data/tilesets/secondary/${secondaryName}/tiles.png`);

  if (!mapBuffer || !primMetaBuffer || !primBlob) return null;

  // 3. Load Palettes
  const palettes = loadPalettes(files, primaryName, secondaryName);

  // 4. Decode Images to Raw Data (Async)
  const primData = await getImageDataAndIndexMap(primBlob);
  const secData = secBlob ? await getImageDataAndIndexMap(secBlob) : null;

  if (!primData) return null;

  // 5. Setup Output Canvas Buffer
  const widthPx = layout.width * META_SIZE;
  const heightPx = layout.height * META_SIZE;
  const outputBuffer = new Uint8ClampedArray(widthPx * heightPx * 4); // RGBA

  const mapData = new Uint16Array(mapBuffer);
  const primMeta = new Uint16Array(primMetaBuffer);
  const secMeta = secMetaBuffer ? new Uint16Array(secMetaBuffer) : new Uint16Array();

  const METATILE_U16_COUNT = 8;
  const PRIMARY_TILE_LIMIT = 512;
  const primaryMetatileCount = primMeta.length / METATILE_U16_COUNT;

  // 6. RENDER LOOP (Pixel Manipulation)
  for (let i = 0; i < mapData.length; i++) {
    const mapX = (i % layout.width) * META_SIZE;
    const mapY = Math.floor(i / layout.width) * META_SIZE;

    const metatileId = mapData[i] & 0x03ff;
    const isSecondaryMetatile = metatileId >= primaryMetatileCount;
    const localMetaId = isSecondaryMetatile ? metatileId - primaryMetatileCount : metatileId;
    const currentMeta = isSecondaryMetatile ? secMeta : primMeta;

    if (localMetaId * METATILE_U16_COUNT >= currentMeta.length) continue;
    const metaOffset = localMetaId * METATILE_U16_COUNT;

    // Loop Layers (Bottom, Top)
    for (let layer = 0; layer < 2; layer++) {
      const layerOffset = metaOffset + layer * 4;

      // Loop Corners
      for (let corner = 0; corner < 4; corner++) {
        const tileAttr = currentMeta[layerOffset + corner];
        const rawTileId = tileAttr & 0x03ff;

        // Skip empty tiles on Top Layer
        if (layer === 1 && rawTileId === 0) continue;

        // Determine Source
        const isSecondaryTile = rawTileId >= PRIMARY_TILE_LIMIT;
        const finalTileId = isSecondaryTile ? rawTileId - PRIMARY_TILE_LIMIT : rawTileId;
        const sourceData = isSecondaryTile ? secData : primData;

        if (!sourceData) continue;

        // Metadata
        const paletteId = (tileAttr >> 12) & 0x0f;
        const flipX = (tileAttr & 0x0400) !== 0;
        const flipY = (tileAttr & 0x0800) !== 0;

        // Calculate Source Coordinates
        const tilesPerRow = Math.floor(sourceData.width / TILE_SIZE);
        const tileSrcX = (finalTileId % tilesPerRow) * TILE_SIZE;
        const tileSrcY = Math.floor(finalTileId / tilesPerRow) * TILE_SIZE;

        // Calculate Dest Coordinates
        const drawX = mapX + (corner % 2) * TILE_SIZE;
        const drawY = mapY + Math.floor(corner / 2) * TILE_SIZE;

        // PIXEL COPY LOOP (8x8)
        for (let py = 0; py < 8; py++) {
          for (let px = 0; px < 8; px++) {
            // Apply Flips
            const srcPx = flipX ? 7 - px : px;
            const srcPy = flipY ? 7 - py : py;

            // Read Index from Source
            const srcIdx = (tileSrcY + srcPy) * sourceData.width + (tileSrcX + srcPx);
            const r = sourceData.data[srcIdx * 4];
            const g = sourceData.data[srcIdx * 4 + 1];
            const b = sourceData.data[srcIdx * 4 + 2];

            // Map RGB -> Index (0-15)
            const colorKey = `${r},${g},${b}`;
            const paletteIndex = sourceData.indexMap.get(colorKey) ?? 0;

            // Transparent Pixel Check
            // Layer 1 (Top) is transparent if index is 0.
            // Layer 0 (Bottom) usually draws index 0 as background color.
            if (layer === 1 && paletteIndex === 0) continue;

            // Get Actual Color from Palette
            // Fallback to magenta if palette missing
            const color = palettes[paletteId] ? palettes[paletteId][paletteIndex] : [255, 0, 255];

            if (!color) continue; // Should not happen

            // Write to Output Buffer
            const destIdx = (drawY + py) * widthPx + (drawX + px);
            outputBuffer[destIdx * 4] = color[0]; // R
            outputBuffer[destIdx * 4 + 1] = color[1]; // G
            outputBuffer[destIdx * 4 + 2] = color[2]; // B
            outputBuffer[destIdx * 4 + 3] = 255; // Alpha
          }
        }
      }
    }
  }

  // 7. Create Canvas from Buffer
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imageData = new ImageData(outputBuffer, widthPx, heightPx);
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/png');
}
