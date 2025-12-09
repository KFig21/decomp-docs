import type { Trainer } from '../../../../../types/decomp';
import TrainerHeader from './TrainerHeader';
import TrainerPokemonCard from './TrainerPokemonCard';

type Props = {
  trainer: Trainer;
};

export default function TrainerCard({ trainer }: Props) {
  console.log('trainer', trainer);
  return (
    <div className="trainer-card">
      <TrainerHeader trainer={trainer} />

      <div className="trainer-party">
        {trainer.party?.map((mon, i) => (
          <TrainerPokemonCard key={i} name={mon.name} level={mon.level} moves={mon.moves} />
        ))}
      </div>
    </div>
  );
}
