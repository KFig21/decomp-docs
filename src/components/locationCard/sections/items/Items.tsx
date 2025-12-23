import { useEffect, useState } from 'react';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';
import ItemSprite from '../../../elements/sprites/ItemSprite';
import type { ParsedMapItem } from '../../../../services/parsers/v2/locations/types';

type Props = {
  items: ParsedMapItem[];
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function ItemsSection({ items, expandAll = true, parentOpen = true }: Props) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [expandAll, parentOpen]);

  return (
    <div className="section container-style">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span>Items ({items.length})</span>
      </div>

      {open && items.length > 0 && (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th className="left">Item</th>
                  <th className="center">Qty</th>
                </tr>
              </thead>
              <tbody>
                {items.map((mappedItem: ParsedMapItem, i) => {
                  const item = mappedItem.item;
                  return (
                    <tr key={i}>
                      <td>
                        <div className="encounter-item">
                          <ItemSprite item={item} />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      {/* TODO - Fix whatever this hard-coded value is */}
                      <td>
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
