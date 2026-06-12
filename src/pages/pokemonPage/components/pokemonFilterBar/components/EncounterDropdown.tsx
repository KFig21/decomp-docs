import MultiDropdown from '../../../../../components/filterBar/MultiDropdown';
import { ENCOUNTER_OPTIONS, ENCOUNTER_COLOR } from '../constants';

interface Props {
  selected: string[];
  onToggle: (v: string) => void;
}

const encounterOptions = ENCOUNTER_OPTIONS.map((e) => ({ ...e, color: ENCOUNTER_COLOR }));

export default function EncounterDropdown({ selected, onToggle }: Props) {
  return (
    <MultiDropdown
      label="Encounter"
      options={encounterOptions}
      selected={selected}
      onToggle={onToggle}
      accentColor={ENCOUNTER_COLOR}
    />
  );
}
