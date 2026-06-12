import MultiDropdown from '../../../../../components/filterBar/MultiDropdown';
import TypeIconBadge from '../../../../../components/elements/typeBadge/TypeIconBadge';
import { TYPE_OPTIONS, TYPE_COLORS, TYPE1_COLOR } from '../constants';

interface Props {
  selected: string[];
  onToggle: (v: string) => void;
}

const typeOptions = TYPE_OPTIONS.map((t) => ({
  value: t,
  label: t,
  color: TYPE_COLORS[t.toLowerCase()],
  icon: <TypeIconBadge type={t} size={14} />,
}));

export default function Type1Dropdown({ selected, onToggle }: Props) {
  return (
    <MultiDropdown
      label="Type 1"
      options={typeOptions}
      selected={selected}
      onToggle={onToggle}
      accentColor={TYPE1_COLOR}
    />
  );
}
