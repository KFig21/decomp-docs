/* eslint-disable @typescript-eslint/no-explicit-any */
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import CategoryBadge from '../../../../components/elements/categoryBadge/CategoryBadge';
import { normalizeTypeName } from '../../MovesPage';
import './styles.scss';

type Props = { move: any };

// ── Boolean flag → display metadata ──────────────────────────────────────────
// Only flags worth showing to a player/developer are listed here.
// Flags that are internal-only (metronomeBanned etc) are grouped as "Banned from".
const FLAG_DISPLAY: Record<
  string,
  { label: string; icon: string; group: 'move-type' | 'banned' | 'misc' }
> = {
  makesContact: { label: 'Makes Contact', icon: '🤜', group: 'move-type' },
  soundMove: { label: 'Sound', icon: '🔊', group: 'move-type' },
  punchingMove: { label: 'Punch', icon: '👊', group: 'move-type' },
  bitingMove: { label: 'Bite', icon: '🦷', group: 'move-type' },
  pulseMove: { label: 'Pulse', icon: '💫', group: 'move-type' },
  ballisticMove: { label: 'Ballistic', icon: '💣', group: 'move-type' },
  windMove: { label: 'Wind', icon: '🌬️', group: 'move-type' },
  powderMove: { label: 'Powder', icon: '🌫️', group: 'move-type' },
  danceMove: { label: 'Dance', icon: '💃', group: 'move-type' },
  slicingMove: { label: 'Slicing', icon: '🗡️', group: 'move-type' },
  healingMove: { label: 'Healing', icon: '💊', group: 'move-type' },
  multiHit: { label: 'Multi-hit', icon: '✖️', group: 'misc' },
  twoTurnMove: { label: 'Two-turn', icon: '⏳', group: 'misc' },
  higherCritRatio: { label: 'High crit', icon: '🎯', group: 'misc' },
  alwaysCriticalHit: { label: 'Always crits', icon: '💥', group: 'misc' },
  ignoresProtect: { label: 'Bypasses Protect', icon: '🛡️', group: 'misc' },
  ignoresSubstitute: { label: 'Hits through Sub', icon: '🪆', group: 'misc' },
  magicCoatAffected: { label: 'Magic Coat', icon: '🪄', group: 'misc' },
  snatchAffected: { label: 'Snatchable', icon: '🤲', group: 'misc' },
  forcePressure: { label: 'Force Pressure', icon: '⬇️', group: 'misc' },
  skyBattleBanned: { label: 'Sky Battle ban', icon: '🚫', group: 'banned' },
  metronomeBanned: { label: 'Metronome ban', icon: '🚫', group: 'banned' },
  copycatBanned: { label: 'Copycat ban', icon: '🚫', group: 'banned' },
  assistBanned: { label: 'Assist ban', icon: '🚫', group: 'banned' },
  mirrorMoveBanned: { label: 'Mirror Move ban', icon: '🚫', group: 'banned' },
  sleepTalkBanned: { label: 'Sleep Talk ban', icon: '🚫', group: 'banned' },
  instructBanned: { label: 'Instruct ban', icon: '🚫', group: 'banned' },
  parentalBondBanned: { label: 'Parental Bond ban', icon: '🚫', group: 'banned' },
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
  const priority = move.priority ?? 0;

  // Collect displayable boolean flags
  const boolFlags: { label: string; icon: string; group: string }[] = [];
  if (move.booleanFlags instanceof Set) {
    for (const [key, meta] of Object.entries(FLAG_DISPLAY)) {
      if ((move.booleanFlags as Set<string>).has(key)) boolFlags.push(meta);
    }
  }
  // Separate by group
  const moveTypeFlags = boolFlags.filter((f) => f.group === 'move-type');
  const miscFlags = boolFlags.filter((f) => f.group === 'misc');
  const bannedFlags = boolFlags.filter((f) => f.group === 'banned');

  return (
    <div className="move-header-card move-card-style">
      {/* ── Title row ── */}
      <div className="move-header-card__top">
        <h1 className="move-header-card__name">{move.name}</h1>
        <div className="move-header-card__badges">
          {typeName && <TypeBadge type={`TYPE_${typeName.toUpperCase()}`} />}
          <CategoryBadge raw={move.category || move.split} showIcon />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="move-header-card__stats">
        <StatCell label="Power" value={move.power ?? '—'} />
        <StatCell label="Accuracy" value={move.accuracy != null ? `${move.accuracy}%` : '—'} />
        <StatCell label="PP" value={move.pp ?? '—'} />
        <StatCell
          label="Priority"
          value={priority > 0 ? `+${priority}` : priority === 0 ? '0' : String(priority)}
        />
        {move.target && (
          <StatCell
            label="Target"
            value={move.target
              .replace(/^MOVE_TARGET_/, '')
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/\b\w/g, (c: string) => c.toUpperCase())}
          />
        )}
      </div>

      {/* ── Description ── */}
      {move.description && (
        <div className="move-header-card__effect">
          <span className="move-header-card__effect-value" style={{ fontStyle: 'italic' }}>
            "{move.description}"
          </span>
        </div>
      )}

      {/* ── Additional effects (secondary effects with %) ── */}
      {move.additionalEffects && move.additionalEffects.length > 0 && (
        <div className="move-header-card__additional-effects">
          {move.additionalEffects.map((e: any, i: number) => (
            <span key={i} className="move-effect-chip">
              {e.label}
              {e.chance != null ? ` (${e.chance}%)` : ''}
            </span>
          ))}
        </div>
      )}

      {/* ── Move-type flags ── */}
      {moveTypeFlags.length > 0 && (
        <div className="move-header-card__flags">
          {moveTypeFlags.map((f) => (
            <span key={f.label} className="move-flag-chip move-flag-chip--type">
              {f.icon} {f.label}
            </span>
          ))}
        </div>
      )}

      {/* ── Misc flags ── */}
      {miscFlags.length > 0 && (
        <div className="move-header-card__flags">
          {miscFlags.map((f) => (
            <span key={f.label} className="move-flag-chip">
              {f.icon} {f.label}
            </span>
          ))}
        </div>
      )}

      {/* ── Banned-from flags (collapsed into one row) ── */}
      {bannedFlags.length > 0 && (
        <div className="move-header-card__flags">
          {bannedFlags.map((f) => (
            <span key={f.label} className="move-flag-chip move-flag-chip--banned">
              {f.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
