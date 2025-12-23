import TrainerSprite from '../../../../../elements/sprites/TrainerSprite';
import ItemSprite from '../../../../../elements/sprites/ItemSprite';
import './styles.scss';
import type { ParsedTrainer } from '../../../../../../services/parsers/v2/trainers/types';

type Props = {
  trainer: ParsedTrainer;
};

export default function TrainerCard({ trainer }: Props) {
  const { name, trainerClass, sprite, items } = trainer;
  return (
    <div className="trainer-card-container">
      <div className="trainer-sprite-container">
        {/* If we have a sprite name from the parser, pass it to TrainerSprite */}
        <TrainerSprite trainerClass={sprite ?? trainerClass} size={64} />
      </div>

      <div className="trainer-info">
        <div className="trainer-class">{trainerClass}</div>
        <div className="trainer-name">{name}</div>
        {items && items.length > 0 && (
          <div className="trainer-items">
            {items.map((item, i) => (
              <ItemSprite key={i} item={item} size={24} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
