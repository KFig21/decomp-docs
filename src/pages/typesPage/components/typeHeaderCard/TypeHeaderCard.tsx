import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import { TYPE_COLORS } from '../../../pokemonPage/components/pokemonFilterBar/PokemonFilterBar';
import './styles.scss';

type Props = {
  type: string;
  pokemonCount: number;
  moveCount: number;
};

export default function TypeHeaderCard({ type, pokemonCount, moveCount }: Props) {
  const typeColor = TYPE_COLORS[type] ?? 'var(--primaryColor)';
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="type-card-style type-header-card" style={{ borderColor: typeColor }}>
      <TypeIconBadge type={type} size={48} />
      <h1 className="type-header-card__name" style={{ color: typeColor }}>{typeLabel}</h1>
      <div className="type-header-card__counts">
        <span className="type-header-card__count">{pokemonCount} Pokémon</span>
        <span className="type-header-card__sep">·</span>
        <span className="type-header-card__count">{moveCount} Moves</span>
      </div>
    </div>
  );
}
