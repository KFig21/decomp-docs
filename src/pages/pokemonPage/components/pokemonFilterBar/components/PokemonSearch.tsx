interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function PokemonSearch({ value, onChange }: Props) {
  return (
    <input
      className="items-search-input"
      type="text"
      placeholder="Search Pokémon…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
