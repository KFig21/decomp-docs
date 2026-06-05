// decomp-docs/src/pages/movesPage/components/moveHeaderCard/MoveHeaderCard.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import { normalizeMoveCategory, normalizeTypeName } from '../../MovesPage';
import './styles.scss';

type Props = { move: any };

const CATEGORY_ICON: Record<string, string> = {
  Physical: '⚔️',
  Special:  '✨',
  Status:   '🔮',
};

const CATEGORY_COLOR: Record<string, string> = {
  Physical: '#c03028',
  Special:  '#6890f0',
  Status:   '#a040a0',
};

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-cell">
      <span className="stat-cell__label">{label}</span>
      <span className="stat-cell__value">{value}</span>
    </div>
  );
}

export default function MoveHeaderCard({ move }: Props) {
  const typeName = normalizeTypeName(move.type);
  const category = normalizeMoveCategory(move.category || move.split);
  const catColor = CATEGORY_COLOR[category] ?? '#7a8a9a';

  const effectLabel = move.effect
    ? move.effect.replace(/^EFFECT_/, '').replace(/_/g, ' ')
        .toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
    : null;

  const priority = move.priority ?? 0;

  return (
    <div className="move-header-card move-card-style">
      {/* ── Title row ── */}
      <div className="move-header-card__top">
        <h1 className="move-header-card__name">{move.name}</h1>
        <div className="move-header-card__badges">
          {typeName && <TypeBadge type={`TYPE_${typeName.toUpperCase()}`} />}
          <span
            className="move-category-badge"
            style={{ '--cat-color': catColor } as any}
          >
            {CATEGORY_ICON[category]} {category}
          </span>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="move-header-card__stats">
        <StatCell label="Power"    value={move.power    ?? '—'} />
        <StatCell label="Accuracy" value={move.accuracy != null ? `${move.accuracy}%` : '—'} />
        <StatCell label="PP"       value={move.pp       ?? '—'} />
        <StatCell label="Priority" value={priority > 0 ? `+${priority}` : priority === 0 ? '0' : priority} />
        {move.secondaryEffectChance != null && move.secondaryEffectChance > 0 && (
          <StatCell label="Effect Chance" value={`${move.secondaryEffectChance}%`} />
        )}
        {move.target && (
          <StatCell
            label="Target"
            value={move.target.replace(/^MOVE_TARGET_/, '').replace(/_/g, ' ')
              .toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
          />
        )}
      </div>

      {/* ── Effect ── */}
      {effectLabel && effectLabel !== 'Hit' && effectLabel !== 'Normal Hit' && (
        <div className="move-header-card__effect">
          <span className="move-header-card__effect-label">Effect</span>
          <span className="move-header-card__effect-value">{effectLabel}</span>
        </div>
      )}

      {/* ── Flags ── */}
      {move.flags && move.flags.length > 0 && (
        <div className="move-header-card__flags">
          {move.flags.map((f: string) => (
            <span key={f} className="move-flag-chip">
              {f.replace(/^FLAG_/, '').replace(/_/g, ' ')
                .toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
