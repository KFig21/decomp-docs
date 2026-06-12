import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../../../../contexts/dataContext';
import CollapseToggle from '../../../../../../components/elements/collapseToggle/CollapseToggle';
import ItemPocketBadge from '../../../../../../components/elements/itemPocketIcon/ItemPocketIcon';
import ItemSprite from '../../../../../../components/elements/sprites/ItemSprite';
import type { ParsedItem } from '../../../../../../services/parsers/v2/items/types';
import './styles.scss';

type Props = {
  mapName: string;
};

export default function MartSection({ mapName }: Props) {
  const { items } = useData();
  const [isOpen, setIsOpen] = useState(true);

  const martItems: ParsedItem[] = Object.values(items).filter((item) =>
    item.locations?.some((loc) => loc.map === mapName && loc.method === 'mart'),
  );

  if (martItems.length === 0) return null;

  return (
    <div className={`section container-style mart-section ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Mart</span>
        <span className="mart-section__count">{martItems.length} items</span>
      </div>

      {isOpen && (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="items-table mart-table">
              <thead>
                <tr>
                  <th className="left">Item</th>
                  <th className="left">Pocket</th>
                  <th className="center">Price</th>
                </tr>
              </thead>
              <tbody>
                {martItems.map((item) => (
                  <tr key={item.key}>
                    <td>
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
                      {item.pocketCategory && <ItemPocketBadge pocket={item.pocketCategory} />}
                    </td>
                    <td className="center mart-price">
                      {item.price ? `₽${item.price.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
