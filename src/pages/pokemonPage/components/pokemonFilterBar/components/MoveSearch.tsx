interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function MoveSearch({ value, onChange }: Props) {
  return (
    <input
      className="items-search-input items-search-input--move"
      type="text"
      placeholder="Learnable move…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
