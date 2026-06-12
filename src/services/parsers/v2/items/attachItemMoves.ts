import type { ParsedItem } from './types';
import type { ParsedAttack } from '../moves/types';

/**
 * Links each TM/HM item to its corresponding move.
 *
 * Handles two decomp formats:
 *   Expansion: ITEM_TM01_FOCUS_PUNCH → MOVE_FOCUS_PUNCH  (derived from key)
 *   Vanilla:   ITEM_TM01 with .secondaryId = MOVE_FOCUS_PUNCH  (stored in secondaryId)
 */
export function attachItemMoves(
  items: Record<string, ParsedItem>,
  moves: Record<string, ParsedAttack>,
): void {
  for (const item of Object.values(items)) {
    if (item.pocketCategory !== 'tms') continue;

    // Try 1: Expansion format — move name embedded in the item key
    //   ITEM_TM01_FOCUS_PUNCH → MOVE_FOCUS_PUNCH  (numbered)
    //   ITEM_TM_ATTRACT       → MOVE_ATTRACT       (unnumbered)
    const derivedKey = item.key.replace(/^ITEM_(?:TM|HM)\d*_/, 'MOVE_');
    if (derivedKey !== item.key && moves[derivedKey]) {
      item.move = moves[derivedKey];
      continue;
    }

    // Try 2: Vanilla format — move referenced via secondaryId field
    if (item.secondaryId && moves[item.secondaryId]) {
      item.move = moves[item.secondaryId];
    }
  }
}
