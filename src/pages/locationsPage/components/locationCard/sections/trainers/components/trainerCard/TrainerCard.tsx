import ItemSprite from '../../../../../../../../components/elements/sprites/ItemSprite';
import TrainerSprite from '../../../../../../../../components/elements/sprites/TrainerSprite';
import type { ParsedItem } from '../../../../../../../../services/parsers/v2/items/types';
import type { ParsedTrainerVariant } from '../../../../../../../../services/parsers/v2/trainers/types';
import './styles.scss';

type Props = {
  trainer: ParsedTrainerVariant;
};

export default function TrainerCard({ trainer }: Props) {
  const { name, trainerClass, sprite, items } = trainer;
  return (
    <div className="trainer-card-container">
      <div className="trainer-sprite-wrapper">
        <div className="trainer-sprite-container">
          {/* If we have a sprite name from the parser, pass it to TrainerSprite */}
          <TrainerSprite trainerClass={sprite ?? trainerClass} size={64} />
        </div>
      </div>

      <div className="trainer-info">
        <div className="trainer-class">{trainerClass}</div>
        <div className="trainer-name">{name}</div>
        {items && items.length > 0 && (
          <div className="trainer-items">
            {items.map((item: ParsedItem, i) => (
              <ItemSprite key={i} item={item} size={24} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
