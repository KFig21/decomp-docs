import MultiDropdown from '../../../../../components/filterBar/MultiDropdown';
import {
  THREAT_MOVE_OPTIONS,
  THREAT_MOVE_COLOR,
  THREAT_MOVE_ALL,
} from '../../../../../constants/threatMoves';

interface Props {
  selected: string[];
  onToggle: (v: string) => void;
}

const threatOptions = [
  { value: THREAT_MOVE_ALL, label: 'Show All', color: THREAT_MOVE_COLOR },
  ...THREAT_MOVE_OPTIONS.map((o) => ({ ...o, color: THREAT_MOVE_COLOR })),
];

export default function ThreatMovesDropdown({ selected, onToggle }: Props) {
  return (
    <MultiDropdown
      label="Threat Moves"
      options={threatOptions}
      selected={selected}
      onToggle={onToggle}
      accentColor={THREAT_MOVE_COLOR}
    />
  );
}
