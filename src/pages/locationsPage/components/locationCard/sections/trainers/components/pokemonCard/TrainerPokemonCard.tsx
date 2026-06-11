/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PokemonSprite from '../../../../../../../../components/elements/sprites/pokemon/PokemonSprite';
import ItemSprite from '../../../../../../../../components/elements/sprites/ItemSprite';
import TypeIconBadge from '../../../../../../../../components/elements/typeBadge/TypeIconBadge';
import type { ParsedTrainerPokemon } from '../../../../../../../../services/parsers/v2/trainers/types';
import './styles.scss';

// ── Helpers ───────────────────────────────────────────────────────────────────
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

const CATEGORY_ICON: Record<string, string> = {
  Physical: '⚔️',
  Special: '✨',
  Status: '🔮',
};

function buildShowdownExport(mon: any): string {
  const lines: string[] = [];
  const name = mon.species?.name ?? mon.species?.key ?? 'Unknown';
  lines.push(mon.heldItem?.name ? `${name} @ ${mon.heldItem.name}` : name);
  const ability = mon.species?.abilities?.[0]?.name;
  if (ability) lines.push(`Ability: ${ability}`);
  if (mon.level != null) lines.push(`Level: ${mon.level}`);
  if (mon.nature?.name) lines.push(`${mon.nature.name} Nature`);
  if (mon.iv != null) {
    const iv = mon.iv;
    lines.push(`IVs: ${iv} HP / ${iv} Atk / ${iv} Def / ${iv} SpA / ${iv} SpD / ${iv} Spe`);
  }
  for (const move of mon.moves ?? []) {
    if (move?.name) lines.push(`- ${move.name}`);
  }
  return lines.join('\n');
}

// ── Copy icon button ──────────────────────────────────────────────────────────
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
      className={`loc-copy-btn ${copied ? 'loc-copy-btn--copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
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

// ── Card ──────────────────────────────────────────────────────────────────────
const MAX_MOVES = 4;

type Props = {
  pokemon: ParsedTrainerPokemon;
  exportMode?: boolean;
  highlight?: boolean;
};

export default function TrainerPokemonCard({
  pokemon,
  exportMode = false,
  highlight = false,
}: Props) {
  const navigate = useNavigate();
  const { species, level, moves = [], heldItem, nature, iv } = pokemon;
  const exportText = buildShowdownExport(pokemon);

  return (
    <div className={`loc-card-wrapper ${highlight ? 'loc-card-wrapper--highlight' : ''}`}>
      <div className={`loc-pokemon-card ${exportMode ? 'loc-pokemon-card--flipped' : ''}`}>
        {/* ── Front ─── */}
        <div
          className="loc-card-face loc-card-face--front"
          onClick={() => navigate(`/pokemon/${species.key}`)}
          title={`View ${species.name}`}
        >
          {/* Sprite + held item */}
          <div className="loc-sprite-area">
            <PokemonSprite name={species.name} size={72} />
            {heldItem && (
              <Link
                to={`/items/${heldItem.key}`}
                className="loc-held-badge"
                title={heldItem.name || heldItem.key}
                onClick={(e) => e.stopPropagation()}
              >
                <ItemSprite item={heldItem} size={14} />
              </Link>
            )}
          </div>

          {/* Name + level */}
          <div className="loc-name-row">
            <span className="loc-name">{species.name}</span>
            <span className="loc-level">Lv.{level}</span>
          </div>

          {/* Types */}
          {species.types && (
            <div className="loc-types">
              {(species.types as string[]).filter(Boolean).map((t) => (
                <TypeIconBadge key={t} type={t} size={18} />
              ))}
            </div>
          )}

          {/* Ability */}
          {species.abilities?.[0]?.name && (
            <Link
              to={`/abilities/${species.abilities[0].key}`}
              className="loc-detail loc-ability"
              onClick={(e) => e.stopPropagation()}
            >
              {species.abilities[0].name}
            </Link>
          )}

          {/* Nature + IV */}
          {(nature || iv != null) && (
            <div className="loc-details-row">
              {nature && <span className="loc-detail">{nature.name}</span>}
              {iv != null && <span className="loc-detail">IV {iv}</span>}
            </div>
          )}

          {/* Moves */}
          <div className="loc-moves">
            {Array.from({ length: MAX_MOVES }).map((_, i) => {
              const move = moves[i];
              if (!move) {
                return (
                  <div key={i} className="loc-move loc-move--empty">
                    —
                  </div>
                );
              }
              const category = normalizeMoveCategory((move as any).category || (move as any).split);
              const typeClass = (move as any).type
                ? `loc-move-type-${(move as any).type.toLowerCase()}`
                : '';
              return (
                <Link
                  key={i}
                  to={`/moves/${(move as any).key}`}
                  className={`loc-move ${typeClass}`}
                  onClick={(e) => e.stopPropagation()}
                  title={`${move.name} (${category})`}
                >
                  <span className="loc-move-icon">{CATEGORY_ICON[category]}</span>
                  <span className="loc-move-name">{move.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Back (Showdown export) ─── */}
        <div className="loc-card-face loc-card-face--back">
          <div className="loc-export-header">
            <span className="loc-export-label">Showdown Export</span>
            <CopyIconButton text={exportText} />
          </div>
          <pre className="loc-export-text">{exportText}</pre>
        </div>
      </div>
    </div>
  );
}
