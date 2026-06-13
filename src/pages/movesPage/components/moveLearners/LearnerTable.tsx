/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';

type Entry = { mon: any; level?: number };

type SortCol =
  | 'name'
  | 'natDexNum'
  | 'level'
  | 'bst'
  | 'hp'
  | 'attack'
  | 'defense'
  | 'spAttack'
  | 'spDefense'
  | 'speed';
type SortDir = 'asc' | 'desc';

const STAT_COLS: { key: SortCol; label: string }[] = [
  { key: 'hp',        label: 'HP' },
  { key: 'attack',    label: 'Atk' },
  { key: 'defense',   label: 'Def' },
  { key: 'spAttack',  label: 'SpA' },
  { key: 'spDefense', label: 'SpD' },
  { key: 'speed',     label: 'Spe' },
];

const NUMERIC_COLS: SortCol[] = ['level', 'bst', 'hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];

function calcBst(mon: any): number {
  if (!mon.baseStats) return 0;
  return Object.values(mon.baseStats).reduce((s: number, v) => s + Number(v), 0);
}

export default function LearnerTable({ learners, showLevel }: { learners: Entry[]; showLevel?: boolean }) {
  const [sortCol, setSortCol] = useState<SortCol>('natDexNum');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (col: SortCol) => {
    if (col === sortCol) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir(NUMERIC_COLS.includes(col) ? 'desc' : 'asc'); }
  };

  const ind = (col: SortCol) => {
    if (col !== sortCol) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...learners].sort((a, b) => {
      switch (sortCol) {
        case 'name':      return dir * (a.mon.name ?? '').localeCompare(b.mon.name ?? '');
        case 'natDexNum': return dir * ((a.mon.natDexNum ?? 99999) - (b.mon.natDexNum ?? 99999));
        case 'level':     return dir * ((a.level ?? 0) - (b.level ?? 0));
        case 'bst':       return dir * (calcBst(a.mon) - calcBst(b.mon));
        default:          return dir * ((a.mon.baseStats?.[sortCol] ?? 0) - (b.mon.baseStats?.[sortCol] ?? 0));
      }
    });
  }, [learners, sortCol, sortDir]);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="learner-table">
        <thead>
          <tr>
            <th className="sortable col-pokemon" onClick={() => handleSort('name')}>
              Pokémon{ind('name')}
            </th>
            <th className="col-types">Types</th>
            <th className="col-abilities">Abilities</th>
            {showLevel && (
              <th className="center sortable col-stat" onClick={() => handleSort('level')}>
                Level{ind('level')}
              </th>
            )}
            <th className="center sortable col-stat" onClick={() => handleSort('bst')}>
              Total{ind('bst')}
            </th>
            {STAT_COLS.map(({ key, label }) => (
              <th key={key} className="center sortable col-stat" onClick={() => handleSort(key)}>
                {label}{ind(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ mon, level }) => {
            const uniqueTypes = Array.from(new Set(mon.types ?? [])).filter(Boolean) as string[];
            const abilities = (mon.abilities ?? []).filter((a: any) => a?.name);
            const total = calcBst(mon);

            return (
              <tr key={mon.key}>
                <td>
                  <Link to={`/pokemon/${mon.key}`} className="learner-table__name-cell">
                    <PokemonSprite name={mon.name} speciesKey={mon.key} size={32} />
                    <span>{mon.name}</span>
                  </Link>
                </td>
                <td>
                  <div className="learner-table__types">
                    {uniqueTypes.map((t) => <TypeIconBadge key={t} type={t} size={18} />)}
                  </div>
                </td>
                <td className="learner-table__abilities">
                  {abilities.length > 0
                    ? abilities.map((a: any, i: number) => (
                        <span key={a.key}>
                          {i > 0 && <span className="learner-table__ability-sep"> / </span>}
                          <Link to={`/abilities/${a.key}`} className="learner-table__ability-link">
                            {a.name}
                          </Link>
                        </span>
                      ))
                    : '—'}
                </td>
                {showLevel && (
                  <td className="center">
                    <span className="learner-card__level">
                      {level === 0 ? 'Evo' : level !== undefined ? `Lv. ${level}` : '—'}
                    </span>
                  </td>
                )}
                <td className="center learner-table__stat-total">{total || '—'}</td>
                {STAT_COLS.map(({ key }) => (
                  <td key={key} className="center">{mon.baseStats?.[key] ?? '—'}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
