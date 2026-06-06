/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import TrainerHeaderCard from './components/trainerHeaderCard/TrainerHeaderCard';
import TrainerParty from './components/trainerParty/TrainerParty';

export default function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { trainers } = useData();

  let selected: any = null;
  for (const group of Object.values(trainers || {})) {
    const variant = (group as any).variants?.find((v: any) => v.key === id);
    if (variant) {
      selected = variant;
      break;
    }
  }

  if (!selected) return <div className="trainers-detail-pane">Trainer not found!</div>;

  return (
    <div className="trainers-detail-pane">
      <TrainerHeaderCard trainer={selected} />
      <TrainerParty party={selected.party} doubleBattle={selected.doubleBattle} />
    </div>
  );
}
