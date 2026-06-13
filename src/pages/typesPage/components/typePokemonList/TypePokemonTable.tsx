/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';

type Props = {
  pokemon: any[];
  unreleasedKeys?: Set<string>;
};

type SortCol =
  | 'name'
  | 'natDexNum'
  | 'bst'
  | 'hp'
  | 'attack'
  | 'defense'
  | 'spAttack'
  | 'spDefense'
  | 'speed';
type SortDir = 'asc' | 'desc';

const STAT_COLS: { key: SortCol; label: string }[] = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Atk' },
  { key: 'defense', label: 'Def' },
  { key: 'spAttack', label: 'SpA' },
  { key: 'spDefense', label: 'SpD' },
  { key: 'speed', label: 'Spe' },
];

function bst(mon: any): number {
  if (!mon.baseStats) return 0;
  return Object.values(mon.baseStats).reduce((s: number, v) => s + Number(v), 0);
}

export default function TypePokemonTable({ pokemon, unreleasedKeys }: Props) {
  const [sortCol, setSortCol] = useState<SortCol>('natDexNum');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const NUMERIC_COLS: SortCol[] = [
    'bst',
    'hp',
    'attack',
    'defense',
    'spAttack',
    'spDefense',
    'speed',
  ];

  const handleSort = (col: SortCol) => {
    if (col === sortCol) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortCol(col);
      setSortDir(NUMERIC_COLS.includes(col) ? 'desc' : 'asc');
    }
  };

  const ind = (col: SortCol) => {
    if (col !== sortCol) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...pokemon].sort((a, b) => {
      switch (sortCol) {
        case 'name':
          return dir * (a.name ?? '').localeCompare(b.name ?? '');
        case 'natDexNum':
          return dir * ((a.natDexNum ?? 99999) - (b.natDexNum ?? 99999));
        case 'bst':
          return dir * (bst(a) - bst(b));
        default:
          return dir * ((a.baseStats?.[sortCol] ?? 0) - (b.baseStats?.[sortCol] ?? 0));
      }
    });
  }, [pokemon, sortCol, sortDir]);

  if (pokemon.length === 0) {
    return <p className="type-section__empty">No Pokémon found for this type.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="type-pokemon-table">
        <thead>
          <tr>
            <th className="sortable col-pokemon" onClick={() => handleSort('name')}>
              Pokémon{ind('name')}
            </th>
            <th className="col-types">Types</th>
            <th className="col-abilities">Abilities</th>
            <th className="center sortable col-stat" onClick={() => handleSort('bst')}>
              Total{ind('bst')}
            </th>
            {STAT_COLS.map(({ key, label }) => (
              <th key={key} className="center sortable col-stat" onClick={() => handleSort(key)}>
                {label}
                {ind(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((mon: any) => {
            const uniqueTypes = Array.from(new Set(mon.types ?? [])).filter(Boolean) as string[];
            const abilities = (mon.abilities ?? []).filter((a: any) => a?.name);
            const isUnreleased = unreleasedKeys?.has(mon.key);
            const total = bst(mon);

            return (
              <tr key={mon.key} className={isUnreleased ? 'row--unreleased' : ''}>
                <td>
                  <Link to={`/pokemon/${mon.key}`} className="type-pokemon-table__name-cell">
                    <PokemonSprite name={mon.name} size={32} />
                    <span>{mon.name}</span>
                  </Link>
                </td>
                <td>
                  <div className="type-pokemon-table__types">
                    {uniqueTypes.map((t) => {
                      const typeLower = t.replace(/^TYPE_/i, '').toLowerCase();
                      return (
                        <Link key={t} to={`/types/${typeLower}`} onClick={(e) => e.stopPropagation()}>
                          <TypeIconBadge type={t} size={20} />
                        </Link>
                      );
                    })}
                  </div>
                </td>
                <td className="type-pokemon-table__abilities">
                  {abilities.length > 0 ? (
                    abilities.map((a: any, i: number) => (
                      <span key={a.key}>
                        {i > 0 && <span className="ability-sep"> / </span>}
                        <Link
                          to={`/abilities/${a.key}`}
                          className="type-pokemon-table__ability-link"
                        >
                          {a.name}
                        </Link>
                      </span>
                    ))
                  ) : (
                    <span className="type-section__empty">—</span>
                  )}
                </td>
                <td className="center stat-total">{total || '—'}</td>
                {STAT_COLS.map(({ key }) => (
                  <td key={key} className="center">
                    {mon.baseStats?.[key] ?? '—'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
