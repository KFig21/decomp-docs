// src/services/mapRenderer.ts
import type { FileContent } from './fileReader';

interface LayoutInfo {
  width: number;
  height: number;
  blockdata_filepath: string;
  primary_tileset: string;
  secondary_tileset: string;
}

type RGB = [number, number, number];
type Palette = RGB[];

// --- CONSTANTS ---
const TILE_SIZE = 8;
const META_SIZE = 16;
const METATILE_U16_COUNT = 8;
const PRIMARY_TILE_LIMIT = 512;

// --- HELPERS ---

/**
 * Global Fuzzy Finder.
 * Locates a tileset folder by name anywhere in the file structure.
 * Returns the FULL path to the requested file (tiles.png or metatiles.bin).
 */
function findTilesetFile(
  files: Map<string, FileContent>,
  tilesetSymbol: string,
  filename: string,
): { path: string; content: FileContent } | null {
  // 1. Clean the symbol: "gTileset_PetalburgGym" -> "PetalburgGym"
  const rawName = tilesetSymbol.replace(/^gTileset_/, '');

  // 2. Generate Candidate Folder Names
  const folderCandidates = [
    // Snake Case: "petalburg_gym"
    rawName
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .toLowerCase(),
    // Raw: "PetalburgGym"
    rawName,
    // Lowercase Raw: "petalburggym"
    rawName.toLowerCase(),
    // Generic variations
    `generic_${rawName.toLowerCase()}`,
    // Special Case: Building -> generic_building
    rawName === 'Building' ? 'generic_building' : '',
  ].filter(Boolean);

  // 3. Scan ALL files to find a matching path
  // We look for any path that ends with "/{folderName}/{filename}"
  for (const folder of folderCandidates) {
    const suffix = `/${folder}/${filename}`.toLowerCase();

    for (const [key, value] of files.entries()) {
      if (key.toLowerCase().endsWith(suffix)) {
        return { path: key, content: value };
      }
    }
  }

  return null;
}

function parseJascPalette(text: string): Palette {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const colors: Palette = [];
  const startIndex = lines[0]?.startsWith('JASC') ? 3 : 0;

  for (let i = startIndex; i < lines.length && colors.length < 16; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 3) {
      colors.push([parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10)]);
    }
  }
  // Fill missing slots with Hot Pink so errors are obvious (instead of invisible black)
  while (colors.length < 16) colors.push([255, 0, 255]);
  return colors;
}

async function getImageData(
  blob: Blob,
): Promise<{ data: Uint8ClampedArray; width: number } | null> {
  const img = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  return { data: ctx.getImageData(0, 0, img.width, img.height).data, width: img.width };
}

// --- MAIN RENDERER ---

export async function generateMapImage(
  layout: LayoutInfo,
  files: Map<string, FileContent>,
): Promise<string | null> {
  // 1. Find Files (Using Global Fuzzy Search)
  const mapFileKey = Array.from(files.keys()).find((k) => k.endsWith(layout.blockdata_filepath));
  const mapFile = mapFileKey ? files.get(mapFileKey) : null;

  const primTiles = findTilesetFile(files, layout.primary_tileset, 'tiles.png');
  const primMeta = findTilesetFile(files, layout.primary_tileset, 'metatiles.bin');

  const secTiles = findTilesetFile(files, layout.secondary_tileset, 'tiles.png');
  const secMeta = findTilesetFile(files, layout.secondary_tileset, 'metatiles.bin');

  if (!mapFile || !primTiles || !primMeta) {
    console.warn('Missing critical assets for:', layout.primary_tileset);
    return null;
  }

  // 2. Load Palettes
  // Primary: Slots 0-15
  // Secondary: Slots 6-15 ONLY (Prevents overwriting global nature tiles)
  const palettes: Palette[] = Array(16)
    .fill(null)
    .map(() => Array(16).fill([0, 0, 0]));

  const loadPalettesFor = (tilesetPath: string, minSlot: number, maxSlot: number) => {
    // Extract the folder path from the FOUND tileset image path.
    // e.g. "data/tilesets/secondary/PetalburgGym/tiles.png" -> "data/tilesets/secondary/PetalburgGym/"
    const folderPath = tilesetPath.substring(0, tilesetPath.lastIndexOf('/') + 1);

    for (let i = minSlot; i <= maxSlot; i++) {
      const slotStr = String(i).padStart(2, '0');

      // Look for palettes inside that exact folder
      // Try "palettes/06.pal" and "palettes/6.pal"
      const candidates = [`${folderPath}palettes/${slotStr}.pal`, `${folderPath}palettes/${i}.pal`];

      for (const path of candidates) {
        // Case-insensitive lookup for the palette file
        const foundKey = Array.from(files.keys()).find(
          (k) => k.toLowerCase() === path.toLowerCase(),
        );
        if (foundKey) {
          const content = files.get(foundKey);
          if (typeof content === 'string') {
            palettes[i] = parseJascPalette(content);
            break; // Found it, move to next slot
          }
        }
      }
    }
  };

  loadPalettesFor(primTiles.path, 0, 15);
  if (secTiles) {
    loadPalettesFor(secTiles.path, 6, 15);
  }

  // 3. Process Images
  const primImgData = await getImageData(primTiles.content as Blob);
  const secImgData = secTiles ? await getImageData(secTiles.content as Blob) : null;
  if (!primImgData) return null;

  // 4. Prepare Buffers
  const mapData = new Uint16Array(mapFile as ArrayBuffer);
  const primMetaArr = new Uint16Array(primMeta.content as ArrayBuffer);
  const secMetaArr = secMeta ? new Uint16Array(secMeta.content as ArrayBuffer) : new Uint16Array();

  const widthPx = layout.width * META_SIZE;
  const heightPx = layout.height * META_SIZE;
  const outputBuffer = new Uint8ClampedArray(widthPx * heightPx * 4);

  // 5. RENDER LOOP
  for (let i = 0; i < mapData.length; i++) {
    const mapX = (i % layout.width) * META_SIZE;
    const mapY = Math.floor(i / layout.width) * META_SIZE;

    const metatileId = mapData[i] & 0x03ff;
    const isSecMeta = metatileId >= PRIMARY_TILE_LIMIT;
    const localMetaId = isSecMeta ? metatileId - PRIMARY_TILE_LIMIT : metatileId;
    const currentMeta = isSecMeta ? secMetaArr : primMetaArr;

    const metaOffset = localMetaId * METATILE_U16_COUNT;

    if (metaOffset >= currentMeta.length) continue;

    for (let layer = 0; layer < 2; layer++) {
      for (let corner = 0; corner < 4; corner++) {
        const attr = currentMeta[metaOffset + layer * 4 + corner];
        const rawTileId = attr & 0x03ff;

        if (layer === 1 && rawTileId === 0) continue;

        // Fix: Determine tile source strictly by ID Limit
        const isSecTile = rawTileId >= PRIMARY_TILE_LIMIT;
        const tileId = isSecTile ? rawTileId - PRIMARY_TILE_LIMIT : rawTileId;
        const source = isSecTile ? secImgData : primImgData;

        if (!source) continue;

        const palId = (attr >> 12) & 0x0f;
        const flipX = (attr & 0x0400) !== 0;
        const flipY = (attr & 0x0800) !== 0;

        const tilesPerRow = Math.floor(source.width / TILE_SIZE);
        const srcX = (tileId % tilesPerRow) * TILE_SIZE;
        const srcY = Math.floor(tileId / tilesPerRow) * TILE_SIZE;

        const drawX = mapX + (corner % 2) * TILE_SIZE;
        const drawY = mapY + Math.floor(corner / 2) * TILE_SIZE;

        for (let py = 0; py < 8; py++) {
          for (let px = 0; px < 8; px++) {
            const sPx = flipX ? 7 - px : px;
            const sPy = flipY ? 7 - py : py;

            // --- Inside the pixel loop (px, py) ---

            const sIdx = ((srcY + sPy) * source.width + (srcX + sPx)) * 4;

            // The Red, Green, and Blue channels in these indexed-to-grayscale
            // PNGs are identical. We just need one.
            const r = source.data[sIdx];
            const a = source.data[sIdx + 3];

            // Calculate index first (0-15)
            // Try BOTH (Math.floor(r / 16)) AND (15 - Math.floor(r / 16))
            // to see which one matches Porymap's vibrant colors.
            const palIdx = 15 - Math.floor(r / 16);

            // 1. Transparency Check
            // Index 0 is the universal transparency color in GBA ROMs.
            if (a === 0 || palIdx === 0) {
              if (layer === 1) continue;
            }

            // 3. Palette Selection
            // "palId" comes from the metatile attributes.
            const pal = palettes[palId];
            const color = pal && pal[palIdx] ? pal[palIdx] : [0, 0, 0];

            const dIdx = ((drawY + py) * widthPx + (drawX + px)) * 4;

            outputBuffer[dIdx] = color[0];
            outputBuffer[dIdx + 1] = color[1];
            outputBuffer[dIdx + 2] = color[2];
            outputBuffer[dIdx + 3] = 255;
          }
        }
      }
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.putImageData(new ImageData(outputBuffer, widthPx, heightPx), 0, 0);
  return canvas.toDataURL('image/png');
}
