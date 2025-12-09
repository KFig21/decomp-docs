type Props = {
  name: string;
  size?: number;
};

export default function ItemSprite({ name, size = 32 }: Props) {
  const safeName = name.toLowerCase().replace('item_', '').replaceAll(' ', '-');
  // example remote URL (Pokémon Showdown item icons)
  const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${safeName}.png`;

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).src =
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'; // placeholder
      }}
    />
  );
}
