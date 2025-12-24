import type { ParsedItem } from '../../../services/parsers/v2/items/types';

type Props = {
  item: ParsedItem;
  size?: number;
};

export default function ItemSprite({ item, size = 32 }: Props) {
  console.log('Rendering ItemSprite for:', item);
  const safeName = item.key
    .toLowerCase()
    .replace('item_', '')
    .replaceAll(' ', '-')
    .replaceAll('_', '-');
  // example remote URL (Pokémon Showdown item icons)
  const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${safeName}.png`;

  return (
    <img
      src={src}
      alt={safeName}
      title={item.name ?? safeName}
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
