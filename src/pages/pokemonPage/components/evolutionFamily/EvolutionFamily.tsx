/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { formatReadableName } from '../../../../utils/functions';
import './styles.scss';

type Props = {
  selected: any;
};

export default function EvolutionFamily({ selected }: Props) {
  const { pokemon, items } = useData();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const formatEvoMethod = (evo: any) => {
    const method = evo.method.replace('EVO_', '');
    if (method === 'LEVEL') return `Level ${evo.param}`;
    if (method === 'ITEM') {
      const item = items[evo.param];
      return `Use ${item ? item.name : formatReadableName(evo.param)}`;
    }
    if (method === 'TRADE') return `Trade`;
    if (method === 'TRADE_ITEM') {
      const item = items[evo.param];
      return `Trade w/ ${item ? item.name : formatReadableName(evo.param)}`;
    }
    if (method === 'FRIENDSHIP') return `High Friendship`;
    return `${formatReadableName(method)} (${formatReadableName(evo.param)})`;
  };

  const findRootNode = (key: string): string => {
    const mon = (pokemon as any)[key];
    if (!mon || !mon.preEvolutions || mon.preEvolutions.length === 0) return key;
    return findRootNode(mon.preEvolutions[0]);
  };

  const rootEvoKey = findRootNode(selected.key);

  const renderEvoTree = (speciesKey: string) => {
    const mon = (pokemon as any)[speciesKey];
    if (!mon) return null;

    const isSelected = mon.key === selected.key;

    return (
      <div key={speciesKey} className="evo-tree-node">
        <div
          className={`evo-node ${isSelected ? 'active' : ''}`}
          onClick={() => navigate(`/pokemon/${mon.key}`)}
        >
          {/* 🚀 ADDED speciesKey={mon.key} HERE */}
          <PokemonSprite name={mon.name} speciesKey={mon.key} size={64} />

          <div className="evo-name">{mon.name}</div>
        </div>

        {mon.evolutions && mon.evolutions.length > 0 && (
          <div className="evo-branches">
            {mon.evolutions.map((evo: any, i: number) => (
              <div key={i} className="evo-branch">
                <div className="evo-arrow-container">
                  <div className="evo-arrow">→</div>
                  <div className="evo-method-text">{formatEvoMethod(evo)}</div>
                </div>
                {renderEvoTree(evo.targetSpecies)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (selected.preEvolutions.length === 0 && selected.evolutions.length === 0) return null;

  return (
    <div className={`section pokemon-card-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Evolution Family</span>
      </div>

      {isOpen && (
        <div className="content evolution-family-container">{renderEvoTree(rootEvoKey)}</div>
      )}
    </div>
  );
}
