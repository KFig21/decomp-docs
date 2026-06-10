import type { ParsedItem } from './types';

/**
 * Cross-references parsed pokemon evolutions against the items map.
 * Any item that is the trigger for an EVO_ITEM or EVO_TRADE_ITEM evolution
 * gets flagged with isEvolutionItem = true.
 *
 * Must be called after both parseItems and parsePokemon have completed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function markEvolutionItems(items: Record<string, ParsedItem>, pokemon: Record<string, any>): void {
  for (const mon of Object.values(pokemon)) {
    for (const evo of mon.evolutions ?? []) {
      const method = (evo.method as string | undefined)?.replace('EVO_', '');
      if ((method === 'ITEM' || method === 'TRADE_ITEM') && evo.param && items[evo.param]) {
        items[evo.param].isEvolutionItem = true;
      }
    }
  }
}
