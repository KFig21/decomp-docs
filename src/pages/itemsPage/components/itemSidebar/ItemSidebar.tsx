/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import { PocketCircle } from '../../../../components/elements/itemPocketIcon/ItemPocketIcon';
import './styles.scss';

type Props = {
  filteredItems: any[];
  activeId?: string;
};

export default function ItemSidebar({ filteredItems, activeId }: Props) {
  return (
    <div className="items-sidebar">
      {filteredItems.map((item) => (
        <Link
          key={item.key}
          to={`/items/${item.key}`}
          className={`items-sidebar-item ${activeId === item.key ? 'active' : ''}`}
        >
          <div className="sprite-container">
            <ItemSprite item={item} size={32} />
          </div>
          <div className="item-info">
            <span className="name">{item.name || item.key}</span>
            {item.pocketCategory && (
              <span className="pocket-indicator">
                <PocketCircle pocket={item.pocketCategory} size={14} />
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
