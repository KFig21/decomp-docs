/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import { CategoryIcon } from '../../../../components/elements/categoryBadge/CategoryBadge';
import './styles.scss';

// ── Move category normaliser ───────────────────────────────────────────────────
function normalizeMoveCategory(raw: string | undefined): 'Physical' | 'Special' | 'Status' {
  if (!raw) return 'Status';
  const bare = raw
    .toUpperCase()
    .replace(/^DAMAGE_CATEGORY_/, '')
    .replace(/^SPLIT_/, '')
    .trim();
  if (bare === 'PHYSICAL') return 'Physical';
  if (bare === 'SPECIAL') return 'Special';
  return 'Status';
}


// ── Showdown export builder ────────────────────────────────────────────────────
function buildShowdownExport(mon: any): string {
  const lines: string[] = [];

  // Name @ Held Item
  const name = mon.species?.name ?? mon.species?.key ?? 'Unknown';
  lines.push(mon.heldItem?.name ? `${name} @ ${mon.heldItem.name}` : name);

  // Ability (first ability only)
  const ability = mon.species?.abilities?.[0]?.name;
  if (ability) lines.push(`Ability: ${ability}`);

  // Level
  if (mon.level != null) lines.push(`Level: ${mon.level}`);

  // Nature
  if (mon.nature?.name) lines.push(`${mon.nature.name} Nature`);

  // IVs — single uniform value applied to all stats in Gen 3/4
  if (mon.iv != null) {
    const iv = mon.iv;
    lines.push(`IVs: ${iv} HP / ${iv} Atk / ${iv} Def / ${iv} SpA / ${iv} SpD / ${iv} Spe`);
  }

  // Moves
  for (const move of mon.moves ?? []) {
    if (move?.name) lines.push(`- ${move.name}`);
  }

  return lines.join('\n');
}

// ── Icon copy button ───────────────────────────────────────────────────────────
function CopyIconButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // eslint-disable-next-line no-empty
    } catch {}
  };

  return (
    <button
      className={`copy-icon-btn ${copied ? 'copy-icon-btn--copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        // Checkmark
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        // Clipboard
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="2" width="6" height="4" rx="1" />
          <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
        </svg>
      )}
    </button>
  );
}

// ── Individual party Pokemon card ─────────────────────────────────────────────
const MAX_MOVES = 4;

function PartyPokemonCard({ pokemon, exportMode }: { pokemon: any; exportMode: boolean }) {
  const navigate = useNavigate();
  const { species, level, moves = [], heldItem, nature, iv } = pokemon;
  const exportText = buildShowdownExport(pokemon);

  return (
    <div className="party-card-wrapper">
      <div className={`party-pokemon-card ${exportMode ? 'party-pokemon-card--flipped' : ''}`}>
        {/* ── Front face ─────────────────────────────────────────────────── */}
        <div
          className="card-face card-face--front"
          onClick={() => navigate(`/pokemon/${species.key}`)}
          title={`View ${species.name}`}
        >
          {/* Sprite + held item */}
          <div className="party-sprite-area">
            <div className="party-sprite-inner">
              <PokemonSprite name={species.name} size={88} />
            </div>
            {heldItem && (
              <Link
                to={`/items/${heldItem.key}`}
                className="held-item-badge"
                title={heldItem.name || heldItem.key}
                onClick={(e) => e.stopPropagation()}
              >
                <ItemSprite item={heldItem} size={16} />
              </Link>
            )}
          </div>

          {/* Name + level */}
          <div className="party-name-row">
            <span className="party-name">{species.name}</span>
            <span className="party-level">Lv.{level}</span>
          </div>

          {/* Types */}
          {species.types && (
            <div className="party-types">
              {species.types.filter(Boolean).map((t: string) => (
                <TypeIconBadge key={t} type={t} size={18} />
              ))}
            </div>
          )}

          {/* Ability */}
          {species.abilities?.[0]?.name && (
            <Link
              to={`/abilities/${species.abilities[0].key}`}
              className="party-ability"
              onClick={(e) => e.stopPropagation()}
            >
              {species.abilities[0].name}
            </Link>
          )}

          {/* Nature + IV */}
          {(nature || iv != null) && (
            <div className="party-details-row">
              {nature && <span className="party-nature">{nature.name}</span>}
              {iv != null && <span className="party-iv">IV {iv}</span>}
            </div>
          )}

          {/* Held item link */}
          {/* {heldItem && (
            <Link
              to={`/items/${heldItem.key}`}
              className="party-held-item"
              onClick={(e) => e.stopPropagation()}
            >
              <ItemSprite item={heldItem} size={14} />
              <span className="held-name">{heldItem.name || heldItem.key}</span>
            </Link>
          )} */}

          {/* Moves */}
          <div className="party-moves">
            {Array.from({ length: MAX_MOVES }).map((_, i) => {
              const move = moves[i];
              if (!move) {
                return (
                  <div key={i} className="party-move party-move--empty">
                    —
                  </div>
                );
              }
              const category = normalizeMoveCategory(move.category || move.split);
              const typeClass = move.type ? `move-type-${move.type.toLowerCase()}` : '';
              return (
                <Link
                  key={i}
                  to={`/moves/${move.key}`}
                  className={`party-move ${typeClass}`}
                  onClick={(e) => e.stopPropagation()}
                  title={`${move.name} (${category})`}
                >
                  <span className="move-category-icon"><CategoryIcon raw={move.category || move.split} size={12} /></span>
                  <span className="move-name">{move.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Back face (Showdown export) ──────────────────────────────── */}
        <div className="card-face card-face--back">
          <div className="export-header">
            <span className="export-label">Showdown Export</span>
            <CopyIconButton text={exportText} />
          </div>
          <pre className="export-text">{exportText}</pre>
        </div>
      </div>
    </div>
  );
}

// ── Party grid — two groups of 3, wraps to stacked rows when space is tight ───

type Props = {
  party: any[];
  exportMode?: boolean;
};

export default function TrainerParty({ party, exportMode = false }: Props) {
  if (!party || party.length === 0) {
    return <p className="empty-state">No party data available.</p>;
  }

  // Split into groups of up to 3
  const groups: any[][] = [];
  for (let i = 0; i < party.length; i += 3) {
    groups.push(party.slice(i, i + 3));
  }

  return (
    <div className="trainer-party-groups">
      {groups.map((group, gi) => (
        <div key={gi} className="trainer-party-group">
          {group.map((mon: any, i: number) => (
            <PartyPokemonCard key={gi * 3 + i} pokemon={mon} exportMode={exportMode} />
          ))}
        </div>
      ))}
    </div>
  );
}
