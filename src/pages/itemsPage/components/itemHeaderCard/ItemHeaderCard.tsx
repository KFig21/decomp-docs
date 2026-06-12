/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import ItemPocketBadge from '../../../../components/elements/itemPocketIcon/ItemPocketIcon';
import './styles.scss';

type Props = {
  selected: any;
};

export default function ItemHeaderCard({ selected }: Props) {
  const buyPrice = selected.price;
  const sellPrice = selected.sellPrice;

  return (
    <div className="item-header-card item-card-style">
      <div className="sprite-showcase">
        <div className="sprite-wrapper">
          <ItemSprite item={selected} size={64} />
        </div>
      </div>

      <div className="header-info">
        <div className="header-top-row">
          <div className="item-name">{selected.name || selected.key}</div>
          {selected.pocketCategory && <ItemPocketBadge pocket={selected.pocketCategory} />}
          {selected.move && (
            <Link to={`/moves/${selected.move.key}`} className="tm-move-link">
              Teaches {selected.move.name}
            </Link>
          )}
        </div>

        <div className="header-bottom-row">
          <div className="price-row">
            <div className="price-block">
              <span className="price-label">Buy</span>
              <span className="price-value">
                {buyPrice ? `₽${buyPrice.toLocaleString()}` : '—'}
              </span>
            </div>
            <div className="price-divider" />
            <div className="price-block">
              <span className="price-label">Sell</span>
              <span className="price-value sell">
                {sellPrice ? `₽${sellPrice.toLocaleString()}` : '—'}
              </span>
            </div>
          </div>
          {selected.description && <div className="item-description">"{selected.description}"</div>}
        </div>
      </div>
    </div>
  );
}
