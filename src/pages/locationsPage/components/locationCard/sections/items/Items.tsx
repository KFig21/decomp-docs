import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CollapseToggle from '../../../../../../components/elements/collapseToggle/CollapseToggle';
import type { ParsedMapItem } from '../../../../../../services/parsers/v2/locations/types';
import ItemSprite from '../../../../../../components/elements/sprites/ItemSprite';

type Props = {
  items: ParsedMapItem[];
  expandAll?: boolean;
  parentOpen?: boolean;
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
                  <th className="center">Qty</th>
                </tr>
              </thead>
              <tbody>
                {items.map((mappedItem: ParsedMapItem, i) => {
                  const item = mappedItem.item;
                  return (
                    <tr key={i}>
                      <td>
                        {/* WRAPPED IN LINK AND STYLED */}
                        <Link
                          to={`/items/${item.key}`}
                          style={{ textDecoration: 'none', color: 'var(--fontColor)' }}
                        >
                          <div className="encounter-item">
                            <ItemSprite item={item} />
                            <span>{item.name}</span>
                          </div>
                        </Link>
                      </td>
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
