/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { formatReadableName } from '../../../../utils/functions';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import CategoryBadge from '../../../../components/elements/categoryBadge/CategoryBadge';
import { useData } from '../../../../contexts/dataContext';
import './styles.scss';

type Props = { learnset: any[] };

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatNumber = (num?: number) => (!num || num === 0 ? '—' : num);

// ITEM_TM26_EARTHQUAKE → "TM26"  |  ITEM_HM01_CUT → "HM01"
function getTmLabel(itemKey: string | undefined): string | null {
  if (!itemKey) return null;
  const m = itemKey.match(/ITEM_((?:TM|HM)\d+)/i);
  if (!m) return null;
  const prefix = m[1].startsWith('HM') ? 'HM' : 'TM';
  const num = m[1].replace(/^(TM|HM)/i, '').padStart(2, '0');
  return `${prefix}${num}`;
}

type LearnMethod = 'tm' | 'hm' | 'tutor';

// ── Filter options ────────────────────────────────────────────────────────────
const METHOD_OPTS: { value: LearnMethod; label: string }[] = [
  { value: 'tm', label: 'TM' },
  { value: 'hm', label: 'HM' },
  { value: 'tutor', label: 'Tutor' },
];

export default function TmHmLearnset({ learnset }: Props) {
  const { items } = useData();
  const [isOpen, setIsOpen] = useState(true);
  const [methodFilter, setMethodFilter] = useState<LearnMethod[]>([]);

  // Build a move-key → TM item lookup from the items record.
  // This is the fix: the expansion format stores learnset entries as { move }
  // with no .tm, so we resolve the TM here from the items dict.
  const tmByMoveKey = useMemo(() => {
    const map: Record<string, any> = {};
    for (const item of Object.values(items || {}) as any[]) {
      if (!item.key?.startsWith('ITEM_TM') && !item.key?.startsWith('ITEM_HM')) continue;
      // ITEM_TM26_EARTHQUAKE → MOVE_EARTHQUAKE
      const moveKey = 'MOVE_' + item.key.replace(/^ITEM_(TM\d+_|HM\d+_|TM_|HM_)/i, '');
      if (!map[moveKey]) map[moveKey] = item;
    }
    return map;
  }, [items]);

  // Enrich each entry with resolved TM item and method type
  const enriched = useMemo(
    () =>
      (learnset ?? []).map((entry: any) => {
        const move = entry.move;
        const moveKey = move?.key ?? (typeof move === 'string' ? move : null);
        // Prefer the .tm already on the entry (vanilla format), fall back to lookup
        const tmItem = entry.tm ?? (moveKey ? tmByMoveKey[moveKey] : null);
        const method: LearnMethod = tmItem
          ? tmItem.key?.startsWith('ITEM_HM')
            ? 'hm'
            : 'tm'
          : 'tutor';
        return { ...entry, move, moveKey, tmItem, method };
      }),
    [learnset, tmByMoveKey],
  );

  const displayed =
    methodFilter.length > 0 ? enriched.filter((e) => methodFilter.includes(e.method)) : enriched;

  // Which method types are actually present in this learnset?
  const presentMethods = useMemo(() => {
    const s = new Set<LearnMethod>();
    enriched.forEach((e) => s.add(e.method));
    return s;
  }, [enriched]);

  const toggleMethod = (m: LearnMethod) =>
    setMethodFilter((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  return (
    <div className={`section pokemon-card-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header tmhm-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Teachable Moves</span>
        {/* Method filter chips — only show methods that exist */}
        {isOpen && presentMethods.size > 1 && (
          <div
            className="tmhm-method-filters"
            onClick={(e) => e.stopPropagation()} // don't collapse when clicking chips
          >
            {METHOD_OPTS.filter((o) => presentMethods.has(o.value)).map((opt) => (
              <button
                key={opt.value}
                className={`tmhm-chip ${methodFilter.includes(opt.value) ? 'tmhm-chip--active' : ''}`}
                onClick={() => toggleMethod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
            {methodFilter.length > 0 && (
              <button className="tmhm-chip tmhm-chip--clear" onClick={() => setMethodFilter([])}>
                ✕ Clear
              </button>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="table-container content" style={{ overflowX: 'auto' }}>
          {displayed.length > 0 ? (
            <table className="learnset-table">
              <thead>
                <tr>
                  <th className="col-method">Method</th>
                  <th>Move</th>
                  <th className="center col-type">Type</th>
                  <th className="center col-cat">Cat.</th>
                  <th className="center col-power">Power</th>
                  <th className="center col-acc">Acc.</th>
                  <th className="center col-pp">PP</th>
                  <th className="col-desc">Description</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((entry: any, i: number) => {
                  const { move, moveKey, tmItem, method } = entry;
                  const moveName = move?.name || formatReadableName(moveKey ?? '');
                  const moveType = move?.type ?? '';
                  const tmLabel = getTmLabel(tmItem?.key);

                  return (
                    <tr key={i}>
                      {/* Method cell */}
                      <td>
                        {method === 'tm' || method === 'hm' ? (
                          <Link
                            to={`/items/${tmItem.key}`}
                            className="learnset-link learnset-link--tm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {tmLabel ?? tmItem.name}
                          </Link>
                        ) : (
                          <span className="tutor-label">Tutor</span>
                        )}
                      </td>
                      {/* Move name */}
                      <td>
                        {moveKey ? (
                          <Link to={`/moves/${moveKey}`} className="learnset-link">
                            {moveName}
                          </Link>
                        ) : (
                          moveName
                        )}
                      </td>
                      <td className="center">{moveType ? <TypeBadge type={moveType} /> : '—'}</td>
                      <td className="center"><CategoryBadge raw={move?.category || move?.split} showIcon /></td>
                      <td className="center">{formatNumber(move?.power)}</td>
                      <td className="center">{move?.accuracy ? `${move.accuracy}%` : '—'}</td>
                      <td className="center">{formatNumber(move?.pp)}</td>
                      <td className="col-desc">{move?.description || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">
              {methodFilter.length > 0
                ? 'No moves match the selected filter.'
                : 'No teachable moves parsed.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
