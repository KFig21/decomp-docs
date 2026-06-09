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
 * Finds an Object Event Sprite (e.g. "OBJ_EVENT_GFX_WOMAN_5" -> "woman_5.png").
 *
 * Overworld sprites live under graphics/object_events/pics/.
 * Trainer battle sprites live under graphics/trainers/<name>/front.png.
 * We must prefer the overworld path and never fall back to battle sprites.
 */
function findSpriteFile(
  files: Map<string, FileContent>,
  graphicsId: string,
): { path: string; content: FileContent } | null {
  const cleanName = graphicsId.replace(/^OBJ_EVENT_GFX_/, '').toLowerCase();
  const targetSuffix = `/${cleanName}.png`;
  const normalize = (s: string) => s.toLowerCase().replace(/\\/g, '/');

  let fallback: { path: string; content: FileContent } | null = null;

  for (const [key, value] of files.entries()) {
    const k = normalize(key);
    if (!k.endsWith(targetSuffix)) continue;

    // Overworld sprites are always under object_events/ — return immediately
    if (k.includes('/object_events/')) return { path: key, content: value };

    // Skip known battle-sprite directories
    if (k.includes('/trainers/') || k.includes('/battle_') || k.includes('/front_sprites/')) continue;

    fallback ??= { path: key, content: value };
  }

  return fallback;
}

/**
 * Parses object_event_graphics_info.c to build a map of sprite name → frame
 * dimensions (width × height in pixels). Uses the OAM struct reference
 * (e.g. `gObjectEventBaseOam_16x32`) which is present in every graphics info
 * struct in the pokeemerald-expansion codebase.
 *
 * Also resolves OBJ_EVENT_GFX_* constants → struct names via the pointer table
 * so callers can look up dimensions directly by the clean GFX name.
 */
function parseObjectEventDimensions(
  files: Map<string, FileContent>,
): Record<string, { w: number; h: number }> {
  const dims: Record<string, { w: number; h: number }> = {};

  // Find the graphics info source file
  const candidates = [
    'object_event_graphics_info.c',
    'object_events_graphics_info.c',
    'event_object_graphics_info.c',
  ];
  let content: string | null = null;
  for (const name of candidates) {
    const found = findFile(files, name);
    if (found && typeof found.content === 'string') {
      content = found.content;
      break;
    }
  }
  if (!content) return dims;

  // Step 1: Extract "InfoStructName" → {w, h} from OAM references
  //   e.g.  gObjectEventGraphicsInfo_Fisherman = { ... .oam = &gObjectEventBaseOam_16x32 ... }
  const byStructName: Record<string, { w: number; h: number }> = {};
  const structRegex = /gObjectEventGraphicsInfo_(\w+)\s*=\s*\{([^{}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = structRegex.exec(content))) {
    const structName = m[1].toLowerCase();
    const body = m[2];
    const oam = body.match(/gObjectEventBaseOam_(\d+)x(\d+)/);
    if (oam) {
      byStructName[structName] = { w: parseInt(oam[1]), h: parseInt(oam[2]) };
    }
  }

  // Step 2: Map OBJ_EVENT_GFX_FOO → struct name via the pointer table
  //   [OBJ_EVENT_GFX_FISHERMAN] = &gObjectEventGraphicsInfo_Fisherman,
  const ptrRegex = /\[OBJ_EVENT_GFX_([A-Z0-9_]+)\]\s*=\s*&gObjectEventGraphicsInfo_(\w+)/g;
  while ((m = ptrRegex.exec(content))) {
    const gfxKey = m[1].toLowerCase();          // e.g. "fisherman"
    const structKey = m[2].toLowerCase();       // e.g. "fisherman"
    const d = byStructName[structKey];
    if (d) dims[gfxKey] = d;
  }

  return dims;
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

  // 4. RENDER OBJECT EVENTS
  if (mapJson && mapJson.object_events) {
    // Parse sprite frame dimensions from the project's C source once per map render
    const spriteDims = parseObjectEventDimensions(files);

    // Sort events by Y so lower sprites render in front of higher ones
    const sortedEvents = [...mapJson.object_events].sort((a, b) => a.y - b.y);

    for (const evt of sortedEvents) {
      const spriteFile = findSpriteFile(files, evt.graphics_id);

      if (spriteFile && spriteFile.content instanceof Blob) {
        const spriteImg = await getImageData(spriteFile.content);
        if (spriteImg) {
          // --- FRAME DIMENSIONS ---
          // Priority 1: parsed from object_event_graphics_info.c (most accurate)
          const cleanKey = evt.graphics_id.replace(/^OBJ_EVENT_GFX_/, '').toLowerCase();
          const parsed = spriteDims[cleanKey];

          let frameWidth: number;
          let frameHeight: number;

          if (parsed) {
            frameWidth = parsed.w;
            frameHeight = parsed.h;
          } else {
            // Fallback heuristic when the C source couldn't be parsed.
            //
            // GBA sprite sheets in pokeemerald-expansion are either:
            //   A) Horizontal strips: (N×frameW) × frameH  — wider than tall
            //   B) Vertical grids:    frameW × (N×frameH)  — taller than wide
            //   C) Single frames:     frameW × frameH      — square or portrait
            //
            // In all cases frame 0 is at (0, 0). We need only its dimensions.
            // GBA hardware allows: 8, 16, 32, 64 px per axis.
            const GBA_DIMS = [8, 16, 32, 64] as const;
            const sw = spriteImg.width;
            const sh = spriteImg.height;

            if (sw === sh) {
              // Square image — single frame (e.g. item ball, 32×32 NPC)
              frameWidth = sw;
              frameHeight = sh;
            } else if (sw > sh) {
              // Case A: horizontal strip
              // Most person NPCs use portrait frames (frameW = frameH / 2).
              frameHeight = sh;
              const halfH = sh >> 1;
              if (halfH >= 8 && sw % halfH === 0) {
                frameWidth = halfH;            // portrait frames in strip (16 from 48×32)
              } else {
                // Square frames in strip: largest GBA size that divides width evenly
                frameWidth = [...GBA_DIMS].reverse().find((d) => d <= sh && sw % d === 0) ?? sh;
              }
            } else {
              // Case B/C: taller than wide — vertical grid or single portrait frame
              frameWidth = sw;
              if (sw <= 16) {
                // Standard small NPC sprite (16 wide): frames are 16×32, cap height to 32
                frameHeight = Math.min(sh, 32);
              } else {
                // Larger sprites (32+ wide): assume square frames stacked vertically
                // Use the largest GBA dimension that is ≤ width (so frames are square)
                frameHeight = [...GBA_DIMS].reverse().find((d) => d <= sw) ?? sw;
              }
            }
          }

          // Clamp to actual image bounds (guard against bad data)
          frameWidth = Math.min(frameWidth, spriteImg.width);
          frameHeight = Math.min(frameHeight, spriteImg.height);

          // --- RENDERING POSITION ---
          // The NPC's (x, y) is in metatile (16 px) coordinates.
          // We align the BOTTOM of the sprite with the BOTTOM of the metatile.
          const drawX = evt.x * META_SIZE;
          const drawY = evt.y * META_SIZE + META_SIZE - frameHeight;

          // --- TRANSPARENCY (background colour removal) ---
          // Sample the top-left pixel as the transparency key colour.
          const sCanvas = document.createElement('canvas');
          sCanvas.width = frameWidth;
          sCanvas.height = frameHeight;
          const sCtx = sCanvas.getContext('2d', { willReadFrequently: true });
          if (!sCtx) continue;

          // Draw only the first frame onto a scratch canvas
          const scratch = document.createElement('canvas');
          scratch.width = spriteImg.width;
          scratch.height = spriteImg.height;
          const scratchCtx = scratch.getContext('2d', { willReadFrequently: true });
          if (!scratchCtx) continue;
          scratchCtx.putImageData(spriteImg, 0, 0);

          // Read the first frame's pixels and key-colour the background
          const frameData = scratchCtx.getImageData(0, 0, frameWidth, frameHeight);
          const bgR = frameData.data[0];
          const bgG = frameData.data[1];
          const bgB = frameData.data[2];
          for (let j = 0; j < frameData.data.length; j += 4) {
            if (
              frameData.data[j] === bgR &&
              frameData.data[j + 1] === bgG &&
              frameData.data[j + 2] === bgB
            ) {
              frameData.data[j + 3] = 0;
            }
          }
          sCtx.putImageData(frameData, 0, 0);

          ctx.drawImage(sCanvas, 0, 0, frameWidth, frameHeight, drawX, drawY, frameWidth, frameHeight);
        }
      }
      // No fallback red box — missing sprites are just skipped silently
    }
  }

  return canvas.toDataURL('image/png');
}
