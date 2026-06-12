import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CollapseToggle from '../../../../../../components/elements/collapseToggle/CollapseToggle';
import type { ParsedMapItem } from '../../../../../../services/parsers/v2/locations/types';
import ItemSprite from '../../../../../../components/elements/sprites/ItemSprite';
import { MethodCircle, METHOD_LABELS } from '../../../../../../components/elements/itemMethodIcon/ItemMethodIcon';

type Props = {
  items: ParsedMapItem[];
  expandAll?: boolean;
  parentOpen?: boolean;
};

function itemDisplayName(item: ParsedMapItem['item']): string {
  if (item.pocketCategory === 'tms') {
    const prefix = item.key.startsWith('ITEM_HM') ? 'HM' : 'TM';
    // Try key first: ITEM_TM01_FOCUS_PUNCH → "01"
    const keyNumMatch = item.key.match(/ITEM_(?:TM|HM)(\d+)/);
    // Fall back to item.name: "TM01" → "01"
    const nameNumMatch = item.name?.match(/^(?:TM|HM)(\d+)$/i);
    const rawNum = (keyNumMatch ?? nameNumMatch)?.[1];
    const num = rawNum ? String(Number(rawNum)).padStart(2, '0') : '';
    const moveName = item.move?.name ?? item.name;
    return num ? `${prefix}${num} - ${moveName}` : `${prefix} - ${moveName}`;
  }
  return item.name;
}

// ParsedMapItem.source -> ItemMethodIcon method key
const SOURCE_TO_METHOD: Record<string, string> = {
  item_ball:   'overworld',
  hidden_item: 'hidden',
  npc:         'npc',
  berry_tree:  'berry_tree',
};

export default function ItemsSection({ items, expandAll = true, parentOpen = true }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, [expandAll, parentOpen]);

  return (
    <div className={`section container-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Items ({items.length})</span>
      </div>

      {isOpen && items.length > 0 && (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th className="left">Item</th>
                  <th className="center">Method</th>
                  <th className="center">Qty</th>
                </tr>
              </thead>
              <tbody>
                {items.map((mappedItem: ParsedMapItem, i) => {
                  const item = mappedItem.item;
                  const method = SOURCE_TO_METHOD[mappedItem.source] ?? 'overworld';
                  return (
                    <tr key={i}>
                      <td>
                        <Link
                          to={`/items/${item.key}`}
                          style={{ textDecoration: 'none', color: 'var(--fontColor)' }}
                        >
                          <div className="encounter-item">
                            <ItemSprite item={item} />
                            <span>{itemDisplayName(item)}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="center">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <MethodCircle method={method} size={18} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--fadedFont)' }}>
                            {METHOD_LABELS[method] ?? method}
                          </span>
                        </div>
                      </td>
                      <td className="center">
                        <div className="encounter-rate">{mappedItem.quantity || 1}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
