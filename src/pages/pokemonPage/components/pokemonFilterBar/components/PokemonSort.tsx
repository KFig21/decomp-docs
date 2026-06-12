import SortDropdown from '../../../../../components/filterBar/SortDropdown';
import { SORT_OPTIONS } from '../constants';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function PokemonSort({ value, onChange }: Props) {
  return <SortDropdown value={value} onChange={onChange} options={SORT_OPTIONS} />;
}
