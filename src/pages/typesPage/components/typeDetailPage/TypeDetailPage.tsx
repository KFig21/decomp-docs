/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { getOffensive, getDefensive } from '../typeChart';
import TypeHeaderCard from '../typeHeaderCard/TypeHeaderCard';
import TypeMatchups from '../typeMatchups/TypeMatchups';
import TypePokemonList from '../typePokemonList/TypePokemonList';
import TypeMovesList from '../typeMovesList/TypeMovesList';
import './styles.scss';

type Props = {
  typeId: string;
  pokemonArray: any[];
  movesArray: any[];
  primaryOnly: boolean;
};

export default function TypeDetailPage({ typeId, pokemonArray, movesArray, primaryOnly }: Props) {
  const typeLower = typeId.toLowerCase();

  const offensive = useMemo(() => getOffensive(typeLower), [typeLower]);
  const defensive = useMemo(() => getDefensive(typeLower), [typeLower]);

  const typePokemon = useMemo(
    () =>
      pokemonArray
        .filter((mon: any) => {
          if (mon.baseSpeciesKey) return false;
          if (!mon.isSeen && !mon.isObtainable) return false;
          const types = (mon.types ?? []) as string[];
          if (primaryOnly) {
            return (types[0] ?? '').replace(/^TYPE_/i, '').toLowerCase() === typeLower;
          }
          return types
            .filter(Boolean)
            .some((t: string) => t.replace(/^TYPE_/i, '').toLowerCase() === typeLower);
        })
        .sort((a: any, b: any) => {
          const aNum = typeof a.natDexNum === 'number' ? a.natDexNum : 99999;
          const bNum = typeof b.natDexNum === 'number' ? b.natDexNum : 99999;
          return aNum - bNum;
        }),
    [pokemonArray, typeLower, primaryOnly],
  );

  const typeMoves = useMemo(
    () =>
      movesArray
        .filter((move: any) => (move.type ?? '').replace(/^TYPE_/i, '').toLowerCase() === typeLower)
        .sort((a: any, b: any) => (a.name ?? '').localeCompare(b.name ?? '')),
    [movesArray, typeLower],
  );

  return (
    <div className="type-detail-page">
      <TypeHeaderCard type={typeLower} pokemonCount={typePokemon.length} moveCount={typeMoves.length} />
      <TypeMatchups offensive={offensive} defensive={defensive} />
      <TypePokemonList pokemon={typePokemon} />
      <TypeMovesList moves={typeMoves} />
    </div>
  );
}
