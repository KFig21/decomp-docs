/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Location, Item } from '../../../types/decomp';
import { getFile } from './utils';

export function parseItems({
  location,
  parsedMap,
  files,
}: {
  location: Location;
  parsedMap: any;
  files: Map<string, string>;
}) {
  const itemScriptsFile = getFile(files, 'data/scripts/item_ball_scripts.inc');
  const itemsFile = getFile(files, 'src/data/items.h');

  if (!itemScriptsFile || !itemsFile) return;

  const objectEvents = parsedMap.object_events ?? [];

  const itemObjs = objectEvents.filter((o: any) => o.graphics_id === 'OBJ_EVENT_GFX_ITEM_BALL');

  for (const obj of itemObjs) {
    const script = obj.script;

    const itemScriptMatch = itemScriptsFile.match(
      new RegExp(`${script}::[\\s\\S]*?finditem\\s+(ITEM_[A-Z0-9_]+)`),
    );

    if (!itemScriptMatch) continue;

    const itemId = itemScriptMatch[1];

    const itemNameMatch = itemsFile.match(
      new RegExp(`\\[${itemId}\\][\\s\\S]*?\\.name\\s*=\\s*_\\("([^"]+)"\\)`),
    );

    if (!itemNameMatch) continue;

    const item: Item = {
      name: itemNameMatch[1],
    };

    location.items.push(item);
  }
}
