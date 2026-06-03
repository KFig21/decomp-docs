/* eslint-disable @typescript-eslint/no-explicit-any */
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import './styles.scss';

type Props = {
  selected: any;
};

export default function ItemHeaderCard({ selected }: Props) {
  return (
    <div className="item-header-card item-card-style">
      <div className="sprite-showcase">
        <div className="sprite-wrapper">
          <ItemSprite item={selected} size={64} />
        </div>
      </div>

      <div className="header-info">
        <div className="item-name">{selected.name || selected.key}</div>

        <div className="price-info">
          <strong>Mart Price:</strong> {selected.price ? `₽${selected.price}` : 'Not sold'}
        </div>

        {selected.description && <p className="item-description">"{selected.description}"</p>}
      </div>
    </div>
  );
}
