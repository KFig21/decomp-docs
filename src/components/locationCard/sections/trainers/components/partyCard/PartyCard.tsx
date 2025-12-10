import type { Trainer } from '../../../../../../types/decomp';
import TrainerCard from '../trainerCard/TrainerCard';
import TrainerPokemonCard from '../pokemonCard/TrainerPokemonCard';
import './styles.scss';

type Props = {
  trainer: Trainer;
};

export default function PartyCard({ trainer }: Props) {
  console.log('trainer', trainer);
  return (
    <div className="party-card-container">
      <TrainerCard trainer={trainer} />

      <div className="trainer-party">
        {trainer.party?.map((mon, i) => (
          <TrainerPokemonCard key={i} name={mon.name} level={mon.level} moves={mon.moves} />
        ))}
      </div>
    </div>
  );
}
