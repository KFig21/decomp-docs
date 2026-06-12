import { dexTypeLabel } from '../constants';

interface Props {
  availableDexTypes: string[];
  selectedDex: string;
  setSelectedDex: (v: string) => void;
}

export default function DexSelector({ availableDexTypes, selectedDex, setSelectedDex }: Props) {
  if (availableDexTypes.length <= 1) return null;

  return (
    <div className="dex-selector">
      <span className="dex-selector__label">Dex</span>
      {availableDexTypes.map((dexType) => (
        <button
          key={dexType}
          className={`dex-selector__btn ${selectedDex === dexType ? 'dex-selector__btn--active' : ''}`}
          onClick={() => setSelectedDex(dexType)}
        >
          {dexTypeLabel(dexType)}
        </button>
      ))}
    </div>
  );
}
