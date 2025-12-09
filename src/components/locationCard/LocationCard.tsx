import { useEffect, useState } from 'react';
import type { Location } from '../../types/decomp';
import './styles.scss';
import Trainers from './sections/trainers/Trainers';
import Encounters from './sections/encounters/Encounters';
import ItemsSection from './sections/items/Items';
import CollapseToggle from '../elements/collapseToggle/CollapseToggle';

type Props = {
  location: Location;
  expandAll?: boolean;
};

export default function LocationCard({ location, expandAll = true }: Props) {
  const [open, setOpen] = useState(true);

  // Sync local state with parent expand/collapse
  useEffect(() => {
    setOpen(expandAll);
  }, [expandAll]);

  return (
    <div className="location-card">
      <div className="location-card-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span className="title">{location.name}</span>
      </div>

      {open && (
        <div className="content">
          <Trainers trainers={location.trainers} expandAll={expandAll} parentOpen={open} />
          <Encounters encounters={location.wildPokemon} expandAll={expandAll} parentOpen={open} />
          <ItemsSection items={location.items} expandAll={expandAll} parentOpen={open} />
        </div>
      )}
    </div>
  );
}
