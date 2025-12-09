import { useEffect, useState } from 'react';
import type { Item } from '../../../../types/decomp';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';
import ItemSprite from '../../../elements/sprites/ItemSprite';

type Props = {
  items: Item[];
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
    <div className="section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span>Items ({items.length})</span>
      </div>

      {open && items.length > 0 && (
        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="item-name">
                  <ItemSprite name={item.name} />
                  <span>{item.name}</span>
                </td>
                {/* TODO - Fix whatever this hard-coded value is */}
                <td>1</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
