/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/PokemonSprite';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import './styles.scss';

type Props = {
  party: any[];
  doubleBattle: boolean;
};

const MAX_MOVES = 4;

function PartyPokemonCard({ pokemon }: { pokemon: any }) {
  const navigate = useNavigate();
  const { species, level, moves = [], heldItem, nature, iv } = pokemon;

  return (
    <div
      className="party-pokemon-card"
      onClick={() => navigate(`/pokemon/${species.key}`)}
      title={`Go to ${species.name}`}
    >
      <div className="party-sprite-area">
        <PokemonSprite name={species.name} />
        {heldItem && (
          <div className="held-item-badge" title={heldItem.name || heldItem.key}>
            <ItemSprite item={heldItem} size={16} />
          </div>
        )}
      </div>

      <div className="party-info">
        <div className="party-name-row">
          <span className="party-name">{species.name}</span>
          <span className="party-level">Lv. {level}</span>
        </div>

        {species.types && (
          <div className="party-types">
            {species.types.filter(Boolean).map((t: string) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        )}

        <div className="party-details-row">
          {nature && <span className="party-nature">{nature.name} nature</span>}
          {iv != null && <span className="party-iv">IV: {iv}</span>}
        </div>

        {heldItem && (
          <div className="party-held-item">
            <span className="held-label">Held:</span>
            <span className="held-name">{heldItem.name || heldItem.key}</span>
          </div>
        )}

        <div className="party-moves">
          {Array.from({ length: MAX_MOVES }).map((_, i) => {
            const move = moves[i];
            return (
              <div key={i} className={`party-move ${!move ? 'party-move--empty' : ''}`}>
                {move ? move.name : '—'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TrainerParty({ party, doubleBattle }: Props) {
  if (!party || party.length === 0) {
    return (
      <div className="trainer-party trainer-card-style">
        <div className="section-header">
          <span>Party</span>
        </div>
        <div className="content">
          <p className="empty-state">No party data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trainer-party trainer-card-style">
      <div className="section-header">
        <span>Party ({party.length})</span>
        {doubleBattle && <span className="double-tag">Double Battle</span>}
      </div>
      <div className="content">
        <div className="party-grid">
          {party.map((mon: any, i: number) => (
            <PartyPokemonCard key={i} pokemon={mon} />
          ))}
        </div>
      </div>
    </div>
  );
}
