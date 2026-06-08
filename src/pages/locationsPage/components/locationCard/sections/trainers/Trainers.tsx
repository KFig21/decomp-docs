import { useEffect, useState, useMemo } from 'react';
import PartyCard from './components/partyCard/PartyCard';
import type { ParsedTrainerVariant } from '../../../../../../services/parsers/v2/trainers/types';
import CollapseToggle from '../../../../../../components/elements/collapseToggle/CollapseToggle';
import './styles.scss';

type Props = {
  trainers: ParsedTrainerVariant[];
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function Trainers({ trainers, expandAll = true, parentOpen = true }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, [expandAll, parentOpen]);

  // Group identical named trainers on this map (e.g., 3 "May"s become 1 group)
  const groupedTrainers = useMemo(() => {
    const groups: Record<string, ParsedTrainerVariant[]> = {};

    trainers.forEach((t) => {
      const nameLower = t.name.toLowerCase();
      // Prevent grouping generic enemies who happen to share a name
      const isGeneric = nameLower.includes('grunt') || nameLower.includes('member');

      const groupKey = isGeneric ? t.key : t.name;

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(t);
    });

    return Object.values(groups);
  }, [trainers]);

  return (
    <div className={`trainers-section container-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        {/* Display the number of unique encounters, rather than total variants */}
        <span>Trainers ({groupedTrainers.length})</span>
      </div>

      {isOpen && (
        <div className="trainers-list">
          {groupedTrainers.map((group, i) => (
            <PartyCard key={i} trainerGroup={group} />
          ))}
        </div>
      )}
    </div>
  );
}
