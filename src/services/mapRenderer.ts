// src/services/mapRenderer.ts
import type { FileContent } from './fileReader';

// --- INTERFACES ---

interface LayoutInfo {
  width: number;
  height: number;
  blockdata_filepath: string;
  primary_tileset: string;
  secondary_tileset: string;
}

export interface MapObjectEvent {
  graphics_id: string;
  x: number;
  y: number;
  elevation: number;
}

export interface MapJson {
  id: string;
  layout: string;
  object_events?: MapObjectEvent[];
}

type RGB = [number, number, number];
type Palette = RGB[];

// --- CONSTANTS ---
const TILE_SIZE = 8;
const META_SIZE = 16; // 1 metatile = 2x2 raw tiles (16px)
const METATILE_U16_COUNT = 8;
const PRIMARY_TILE_LIMIT = 512;

// --- HELPERS ---

/**
 * Finds a file in the file map using fuzzy matching on the path.
 */
function findFile(
  files: Map<string, FileContent>,
  partialPath: string,
): { path: string; content: FileContent } | null {
  const normalize = (s: string) => s.toLowerCase().replace(/\\/g, '/');
  const target = normalize(partialPath);

  // 1. Try Exact Match first (fastest)
  for (const [key, value] of files.entries()) {
    if (normalize(key).endsWith(target)) {
      return { path: key, content: value };
    }
  }
  return null;
}

/**
 * Finds a Tileset asset (tiles.png or metatiles.bin).
 */
function findTilesetFile(
  files: Map<string, FileContent>,
  tilesetSymbol: string,
  filename: string,
): { path: string; content: FileContent } | null {
  const rawName = tilesetSymbol.replace(/^gTileset_/, '');

  // Strategy: Try multiple naming conventions
  const candidates = [
    // Standard: "PetalburgGym"
    rawName,
    // Snake: "petalburg_gym"
    rawName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase(),
    // Lowercase: "petalburggym"
    rawName.toLowerCase(),
    // Generic folders
    `generic_${rawName.toLowerCase()}`,
  ];

  for (const folder of candidates) {
    const res = findFile(files, `/${folder}/${filename}`);
    if (res) return res;
  }
  return null;
}

/**
 * Finds an Object Event Sprite (e.g. "OBJ_EVENT_GFX_WOMAN_5" -> "woman_5.png")
 */
function findSpriteFile(
  files: Map<string, FileContent>,
  graphicsId: string,
): { path: string; content: FileContent } | null {
  // 1. Clean the ID: "OBJ_EVENT_GFX_WOMAN_5" -> "woman_5"
  let cleanName = graphicsId.replace(/^OBJ_EVENT_GFX_/, '').toLowerCase();

  // 2. Special overrides for common inconsistencies
  if (cleanName === 'item_ball') cleanName = 'item_ball';
  // Add more overrides here if you find broken sprites

  // 3. Search in standard graphics folders
  // We look for any file ending in "/{cleanName}.png"
  // This handles paths like "graphics/object_events/pics/people/woman_5.png"
  return findFile(files, `/${cleanName}.png`) || findFile(files, `/${cleanName}/front.png`);
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
  while (colors.length < 16) colors.push([255, 0, 255]);
  return colors;
}

async function getImageData(blob: Blob): Promise<ImageData | null> {
  const img = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

// --- MAIN RENDERER ---

export async function generateMapImage(
  layout: LayoutInfo,
  files: Map<string, FileContent>,
  mapJson?: MapJson, // OPTIONAL: Pass the Map JSON to render events
): Promise<string | null> {
  // 1. SETUP & ASSET LOADING (Keep your existing working logic here)
  const mapFileKey = Array.from(files.keys()).find((k) => k.endsWith(layout.blockdata_filepath));
  const mapFile = mapFileKey ? files.get(mapFileKey) : null;

  const primTiles = findTilesetFile(files, layout.primary_tileset, 'tiles.png');
  const primMeta = findTilesetFile(files, layout.primary_tileset, 'metatiles.bin');
  const secTiles = findTilesetFile(files, layout.secondary_tileset, 'tiles.png');
  const secMeta = findTilesetFile(files, layout.secondary_tileset, 'metatiles.bin');

  if (!mapFile || !primTiles || !primMeta) return null;

  // Load Palettes (Using your adjusted ranges)
  const palettes: Palette[] = Array(16)
    .fill(null)
    .map(() => Array(16).fill([0, 0, 0]));

  const loadPalettesFor = (tilesetPath: string, minSlot: number, maxSlot: number) => {
    const folderPath = tilesetPath.substring(0, tilesetPath.lastIndexOf('/') + 1);
    for (let i = minSlot; i <= maxSlot; i++) {
      const slotStr = String(i).padStart(2, '0');
      const candidates = [`${folderPath}palettes/${slotStr}.pal`, `${folderPath}palettes/${i}.pal`];
      for (const path of candidates) {
        const found = findFile(files, path);
        if (found && typeof found.content === 'string') {
          palettes[i] = parseJascPalette(found.content);
          break;
        }
      }
    }
  };

  loadPalettesFor(primTiles.path, 0, 5);
  if (secTiles) loadPalettesFor(secTiles.path, 6, 12);

  const primImgData = await getImageData(primTiles.content as Blob);
  const secImgData = secTiles ? await getImageData(secTiles.content as Blob) : null;
  if (!primImgData) return null;

  // 2. PREPARE CANVAS
  const widthPx = layout.width * META_SIZE;
  const heightPx = layout.height * META_SIZE;

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Buffer for raw pixel manipulation of the BACKGROUND MAP
  const outputBuffer = ctx.createImageData(widthPx, heightPx);
  const mapData = new Uint16Array(mapFile as ArrayBuffer);
  const primMetaArr = new Uint16Array(primMeta.content as ArrayBuffer);
  const secMetaArr = secMeta ? new Uint16Array(secMeta.content as ArrayBuffer) : new Uint16Array();

  // 3. RENDER MAP TILES (Your working Loop)
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
            const sIdx = ((srcY + sPy) * source.width + (srcX + sPx)) * 4;

            const r = source.data[sIdx];
            const a = source.data[sIdx + 3];

            // USE YOUR WORKING COLOR LOGIC HERE
            // This is the "Inverted" logic we discussed that likely worked
            const palIdx = 15 - Math.floor(r / 16);

            if (a === 0 || palIdx === 0) {
              if (layer === 1) continue;
            }

            const pal = palettes[palId];
            const color = pal && pal[palIdx] ? pal[palIdx] : [0, 0, 0];
            const dIdx = ((drawY + py) * widthPx + (drawX + px)) * 4;

            outputBuffer.data[dIdx] = color[0];
            outputBuffer.data[dIdx + 1] = color[1];
            outputBuffer.data[dIdx + 2] = color[2];
            outputBuffer.data[dIdx + 3] = 255;
          }
        }
      }
    }
  }

  // Put the background map onto the canvas
  ctx.putImageData(outputBuffer, 0, 0);

  // 4. RENDER OBJECT EVENTS (The New Part)
  if (mapJson && mapJson.object_events) {
    // Sort events by Y coordinate so lower objects appear "in front" of higher ones
    const sortedEvents = [...mapJson.object_events].sort((a, b) => a.y - b.y);

    for (const evt of sortedEvents) {
      const spriteFile = findSpriteFile(files, evt.graphics_id);

      if (spriteFile && spriteFile.content instanceof Blob) {
        const spriteImg = await getImageData(spriteFile.content);
        if (spriteImg) {
          // --- SPRITE DIMENSION LOGIC ---
          let frameWidth = spriteImg.width;
          const frameHeight = spriteImg.height;

          // Heuristic for Gen 3 Sprites:
          // 1. Most NPCs (People) are strips of animations.
          //    If the image is wider than it is tall, it's likely a strip.
          //    The standard width for a person is 16px.
          if (frameWidth > frameHeight) {
            frameWidth = 16;
          }

          // 2. Some "Big" Pokemon/Objects are 32x32 or 64x64.
          //    If width == height, it's likely a static object or large sprite
          //    that doesn't need slicing (like an Item Ball or Berry Tree).
          //    (No change needed to frameWidth in this case)

          // 3. Calculate Rendering Position
          //    Porymap aligns the BOTTOM of the sprite with the BOTTOM of the tile.
          //    Events are at (x, y) metatile coordinates (16px grid).
          const drawX = evt.x * META_SIZE;

          //    Shift Y up so the "feet" land on the tile.
          //    If sprite is 32px tall, it shifts up by 16px.
          //    If sprite is 16px tall (Item Ball), it doesn't shift.
          const drawY = evt.y * META_SIZE - (frameHeight - META_SIZE);

          // --- TRANSPARENCY (Green Screen Removal) ---
          const sCanvas = document.createElement('canvas');
          sCanvas.width = spriteImg.width;
          sCanvas.height = spriteImg.height;
          const sCtx = sCanvas.getContext('2d');
          if (!sCtx) continue;

          const imgData = spriteImg;
          // Sample the top-left pixel (0,0) as the background color
          const bgR = imgData.data[0];
          const bgG = imgData.data[1];
          const bgB = imgData.data[2];

          // Apply alpha = 0 to matching background pixels
          for (let j = 0; j < imgData.data.length; j += 4) {
            if (
              imgData.data[j] === bgR &&
              imgData.data[j + 1] === bgG &&
              imgData.data[j + 2] === bgB
            ) {
              imgData.data[j + 3] = 0;
            }
          }

          sCtx.putImageData(imgData, 0, 0);

          // --- DRAW SLICED FRAME ---
          // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
          ctx.drawImage(
            sCanvas,
            0,
            0,
            frameWidth,
            frameHeight, // Source: Grab top-left frame
            drawX,
            drawY,
            frameWidth,
            frameHeight, // Dest: Draw at calculated pos
          );
        }
      } else {
        // Fallback: Red Box
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(evt.x * META_SIZE, evt.y * META_SIZE, META_SIZE, META_SIZE);
      }
    }
  }

  return canvas.toDataURL('image/png');
}
