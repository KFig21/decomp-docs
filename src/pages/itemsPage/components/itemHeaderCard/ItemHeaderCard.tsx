/* eslint-disable @typescript-eslint/no-explicit-any */
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import './styles.scss';

type Props = {
  selected: any;
};

const POCKET_LABELS: Record<string, string> = {
  items: 'Items Pocket',
  balls: 'Poké Balls',
  tms: 'TMs & HMs',
  berries: 'Berries',
  'key-items': 'Key Items',
};

export default function ItemHeaderCard({ selected }: Props) {
  const buyPrice = selected.price;
  const sellPrice = selected.sellPrice;
  const pocketLabel = selected.pocketCategory
    ? (POCKET_LABELS[selected.pocketCategory] ?? selected.pocketCategory)
    : null;

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
          {pocketLabel && <span className="pocket-badge">{pocketLabel}</span>}
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
