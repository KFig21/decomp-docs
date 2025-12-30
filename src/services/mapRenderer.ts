// src/services/mapRenderer.ts
import { getFileBlob, getFileBuffer } from './parsers/v2/utils';
import type { FileContent } from './fileReader';

interface LayoutInfo {
  width: number;
  height: number;
  blockdata_filepath: string; // "data/layouts/.../map.bin"
  primary_tileset: string; // "gTileset_General"
  secondary_tileset: string; // "gTileset_Petalburg"
}

// Helper to clean tileset names: "gTileset_General" -> "general"
function formatTilesetName(symbol: string): string {
  return (
    symbol
      // remove gTileset_ prefix
      .replace(/^gTileset_/, '')

      // insert underscore between camelCase / PascalCase boundaries
      // FortreeGym -> Fortree_Gym
      // MtChimney -> Mt_Chimney
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')

      // Route119 stays Route119 (no underscore before numbers)
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')

      // normalize
      .toLowerCase()
  );
}

export async function generateMapImage(
  layout: LayoutInfo,
  files: Map<string, FileContent>,
): Promise<string | null> {
  // 1. Resolve Paths
  const primaryName = formatTilesetName(layout.primary_tileset);
  const secondaryName = formatTilesetName(layout.secondary_tileset);

  const paths = {
    map: layout.blockdata_filepath,
    primaryTiles: `data/tilesets/primary/${primaryName}/tiles.png`,
    primaryMeta: `data/tilesets/primary/${primaryName}/metatiles.bin`,
    secondaryTiles: `data/tilesets/secondary/${secondaryName}/tiles.png`,
    secondaryMeta: `data/tilesets/secondary/${secondaryName}/metatiles.bin`,
  };

  // 2. Fetch Data
  const mapBuffer = getFileBuffer(files, paths.map);
  const primMetaBuffer = getFileBuffer(files, paths.primaryMeta);
  const secMetaBuffer = getFileBuffer(files, paths.secondaryMeta);
  const primBlob = getFileBlob(files, paths.primaryTiles);
  const secBlob = getFileBlob(files, paths.secondaryTiles);

  if (!mapBuffer || !primMetaBuffer || !primBlob) {
    console.warn(`Missing assets for layout: ${layout.blockdata_filepath}`);
    return null;
  }

  try {
    // 3. Prepare Typed Arrays
    const mapData = new Uint16Array(mapBuffer);
    const primMeta = new Uint16Array(primMetaBuffer);
    const secMeta = secMetaBuffer ? new Uint16Array(secMetaBuffer) : new Uint16Array();

    // 4. Load Images (Async)
    const primImg = await createImageBitmap(primBlob);
    const secImg = secBlob ? await createImageBitmap(secBlob) : null;

    // 5. Setup Canvas
    const TILE_SIZE = 8;
    const META_SIZE = 16;
    const canvas = document.createElement('canvas');
    canvas.width = layout.width * META_SIZE;
    canvas.height = layout.height * META_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 6. Render Loop
    for (let i = 0; i < mapData.length; i++) {
      const mapX = (i % layout.width) * META_SIZE;
      const mapY = Math.floor(i / layout.width) * META_SIZE;

      const metatileId = mapData[i] & 0x03ff;
      const METATILE_U16_COUNT = 8;
      const primaryCount = primMeta.length / METATILE_U16_COUNT;

      const isSecondary = metatileId >= primaryCount;
      const localMetaId = isSecondary ? metatileId - primaryCount : metatileId;

      const currentMeta = isSecondary ? secMeta : primMeta;
      const currentImg = isSecondary ? secImg : primImg;

      if (!currentImg || localMetaId * 4 >= currentMeta.length) {
        continue;
      }

      const offset = localMetaId * METATILE_U16_COUNT;

      // Draw the 4 corners (TopL, TopR, BotL, BotR)
      for (let corner = 0; corner < 4; corner++) {
        if (offset + corner >= currentMeta.length) break;

        const tileAttr = currentMeta[offset + corner];
        const tileId = tileAttr & 0x03ff;
        const flipX = (tileAttr & 0x0400) !== 0;
        const flipY = (tileAttr & 0x0800) !== 0;

        // Source coords on the png
        const tilesPerRow = currentImg.width / TILE_SIZE;

        const srcX = (tileId % tilesPerRow) * TILE_SIZE;
        const srcY = Math.floor(tileId / tilesPerRow) * TILE_SIZE;

        // Dest coords on the canvas
        const drawX = mapX + (corner % 2) * TILE_SIZE;
        const drawY = mapY + Math.floor(corner / 2) * TILE_SIZE;

        if (flipX || flipY) {
          ctx.save();
          ctx.translate(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2);
          ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
          ctx.drawImage(
            currentImg,
            srcX,
            srcY,
            TILE_SIZE,
            TILE_SIZE,
            -TILE_SIZE / 2,
            -TILE_SIZE / 2,
            TILE_SIZE,
            TILE_SIZE,
          );
          ctx.restore();
        } else {
          ctx.drawImage(
            currentImg,
            srcX,
            srcY,
            TILE_SIZE,
            TILE_SIZE,
            drawX,
            drawY,
            TILE_SIZE,
            TILE_SIZE,
          );
        }
      }
    }

    // 7. Return Data URL
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Error rendering map', e);
    return null;
  }
}
