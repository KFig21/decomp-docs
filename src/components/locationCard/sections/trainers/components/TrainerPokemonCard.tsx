import PokemonSprite from '../../../../elements/sprites/PokemonSprite';

type Props = {
  name: string;
  level: number;
  moves: string[];
};

export default function TrainerPokemonCard({ name, level, moves }: Props) {
  return (
    <div className="trainer-pokemon">
      <PokemonSprite name={name} />

      <div className="mon-info">
        <div className="mon-name">{name}</div>
        <div className="mon-level">Lv {level}</div>
        {moves.length > 0 && <div className="mon-moves">{moves.join(', ')}</div>}
      </div>
    </div>
  );
}
