/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import HeldByPokemon from './components/heldByPokemon/HeldByPokemon';
import ItemHeaderCard from './components/itemHeaderCard/ItemHeaderCard';
import ItemLocations from './components/itemLocations/ItemLocations';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { items } = useData();

  const itemsArray = (Array.isArray(items) ? items : Object.values(items || {})) as any[];
  const selected = itemsArray.find((i) => i.key === id);

  if (!selected) return <div className="items-detail-pane">Item not found!</div>;

  return (
    <div className="items-detail-pane">
      <ItemHeaderCard selected={selected} />
      <ItemLocations locations={selected.locations} />
      <HeldByPokemon item={selected} />
    </div>
  );
}
