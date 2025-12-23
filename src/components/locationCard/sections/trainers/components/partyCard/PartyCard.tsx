import TrainerCard from '../trainerCard/TrainerCard';
import TrainerPokemonCard from '../pokemonCard/TrainerPokemonCard';
import './styles.scss';
import type { ParsedTrainer } from '../../../../../../services/parsers/v2/trainers/types';

type Props = {
  trainer: ParsedTrainer;
};

export default function PartyCard({ trainer }: Props) {
  return (
    <div className="party-card-container">
      <TrainerCard trainer={trainer} />

      <div className="trainer-party">
        {trainer.party?.map((mon, i) => (
          <TrainerPokemonCard key={i} pokemon={mon} />
        ))}
      </div>
    </div>
  );
}
