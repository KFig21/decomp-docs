/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import './styles.scss';

type HeldChance = 'common' | 'uncommon' | 'rare';

interface HeldItemEntry {
  item: any;
  chance: HeldChance;
}

interface Props {
  heldItems?: HeldItemEntry[];
}

const CHANCE_META: Record<HeldChance, { label: string; pct: string; mod: string }> = {
  common: { label: 'Common', pct: '50%', mod: 'common' },
  uncommon: { label: 'Uncommon', pct: '5%', mod: 'uncommon' },
  rare: { label: 'Rare', pct: '1%', mod: 'rare' },
};

export default function PokemonHeldItems({ heldItems }: Props) {
  if (!heldItems || heldItems.length === 0) return null;

  return (
    <div className="pokemon-card-style pokemon-held-items">
      <div className="section-header">Wild Held Items</div>
      <div className="content">
        <div className="held-items-list">
          {heldItems.map(({ item, chance }) => {
            const meta = CHANCE_META[chance] ?? CHANCE_META.common;
            return (
              <Link
                key={`${item.key}-${chance}`}
                to={`/items/${item.key}`}
                className="held-item-row"
              >
                <div className="held-item-sprite">
                  <ItemSprite item={item} size={32} />
                </div>
                <div className="held-item-info">
                  <span className="held-item-name">{item.name}</span>
                  {item.description && <span className="held-item-desc">{item.description}</span>}
                </div>
                <span
                  className={`held-chance-badge held-chance-badge--${meta.mod}`}
                  title={meta.pct}
                >
                  {meta.label} · {meta.pct}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
