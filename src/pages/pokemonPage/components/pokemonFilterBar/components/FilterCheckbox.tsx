interface Props {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  modifier?: string;
}

export default function FilterCheckbox({ label, checked, onChange, modifier }: Props) {
  return (
    <label className={`obtainable-toggle${modifier ? ` obtainable-toggle--${modifier}` : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
