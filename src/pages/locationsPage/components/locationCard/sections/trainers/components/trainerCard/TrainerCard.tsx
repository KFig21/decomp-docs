/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ItemSprite from '../../../../../../../../components/elements/sprites/ItemSprite';
import TrainerSprite from '../../../../../../../../components/elements/sprites/TrainerSprite';
import { useData } from '../../../../../../../../contexts/dataContext';
import type { ParsedItem } from '../../../../../../../../services/parsers/v2/items/types';
import type { ParsedTrainerVariant } from '../../../../../../../../services/parsers/v2/trainers/types';
import './styles.scss';

type Props = {
  trainer: ParsedTrainerVariant;
};

export default function TrainerCard({ trainer }: Props) {
  const { name, trainerClass, trainerPic, items } = trainer;
  const { trainers } = useData();

  const baseKey = useMemo(() => {
    for (const [key, group] of Object.entries(trainers as Record<string, { variants: any[] }>)) {
      if ((group.variants as any[]).some((v) => v.key === trainer.key)) return key;
    }
    return null;
  }, [trainers, trainer.key]);

  const spriteEl = (
    <div className="trainer-sprite-wrapper">
      <div className="trainer-sprite-container">
        <TrainerSprite
          name={name}
          trainerClass={trainerPic ?? trainerClass}
          sprite={trainerPic}
          size={64}
        />
      </div>
    </div>
  );

  return (
    <div className="trainer-card-container">
      {baseKey ? (
        <Link to={`/trainers/${baseKey}`} className="trainer-card-link" title={`View ${name}`}>
          {spriteEl}
        </Link>
      ) : (
        spriteEl
      )}

      <div className="trainer-info">
        <div className="trainer-class">{trainerClass}</div>
        {baseKey ? (
          <Link to={`/trainers/${baseKey}`} className="trainer-name-link">
            <div className="trainer-name">{name}</div>
          </Link>
        ) : (
          <div className="trainer-name">{name}</div>
        )}
        {items && items.length > 0 && (
          <div className="trainer-items">
            {items.map((item: ParsedItem, i) => (
              <Link key={i} to={`/items/${item.key}`} title={item.name || item.key}>
                <ItemSprite item={item} size={24} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
