/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useTrainerTab } from '../../../../contexts/trainerTabContext';
import { formatReadableName } from '../../../../utils/functions';
import TrainerParty from '../trainerParty/TrainerParty';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import './styles.scss';

type Props = {
  battleIndex: number;
  variants: any[];
};

function formatTabName(key: string, index: number): string {
  const parts = key.split('_');
  const lastPart = parts[parts.length - 1];
  if (!lastPart) return `Variant ${index + 1}`;
  if (!isNaN(Number(lastPart))) return `Variant ${lastPart}`;
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
}

export default function TrainerBattleCard({ battleIndex, variants }: Props) {
  const { globalTab, setGlobalTab } = useTrainerTab();
  const [isOpen, setIsOpen] = useState(true);
  const [exportMode, setExportMode] = useState(false);

  let activeIndex = 0;
  if (globalTab && variants.length > 1) {
    const match = variants.findIndex((v, i) => formatTabName(v.key, i) === globalTab);
    if (match !== -1) activeIndex = match;
  }

  const active = variants[activeIndex];
  if (!active) return null;

  const { location, doubleBattle, items, party } = active;
  const locationName = location?.locationKey ? formatReadableName(location.locationKey) : null;
  const mapName = location?.mapKey ? formatReadableName(location.mapKey) : null;
  const displayLocation = mapName ?? locationName ?? `Battle ${battleIndex + 1}`;

  return (
    <div className="trainer-battle-card trainer-card-style">
      {/* ── Header ── */}
      <div className="battle-header">
        <div className="battle-header__left" onClick={() => setIsOpen((o) => !o)}>
          <CollapseToggle isOpen={isOpen} />
          <span className="battle-index">#{battleIndex + 1}</span>
          <div className="battle-location">
            <span className="battle-location__name">{displayLocation}</span>
            {locationName && mapName && mapName !== locationName && (
              <span className="battle-location__sub">{locationName}</span>
            )}
          </div>
          {doubleBattle && <span className="double-tag">Double Battle</span>}
        </div>

        <div className="battle-header__right">
          {items && items.length > 0 && (
            <div className="battle-items">
              {items.map((item: any, i: number) => (
                <div key={i} className="battle-item-chip" title={item.name || item.key}>
                  <ItemSprite item={item} size={18} />
                  <span>{item.name || item.key}</span>
                </div>
              ))}
            </div>
          )}

          <button
            className={`export-toggle-btn ${exportMode ? 'export-toggle-btn--active' : ''}`}
            onClick={() => setExportMode((m) => !m)}
            title="Toggle Showdown export view"
          >
            {exportMode ? 'Normal' : 'Export'}
          </button>
        </div>
      </div>

      {/* ── Starter variant tabs ── */}
      {isOpen && variants.length > 1 && (
        <div className="battle-tabs">
          <span className="battle-tabs__label">Starter:</span>
          {variants.map((v, i) => {
            const tabName = formatTabName(v.key, i);
            return (
              <button
                key={v.key}
                className={`tab-btn ${i === activeIndex ? 'tab-btn--active' : ''}`}
                onClick={() => setGlobalTab(tabName)}
              >
                {tabName}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Party grid ── */}
      {isOpen && (
        <div className="battle-content">
          <TrainerParty party={party} exportMode={exportMode} />
        </div>
      )}
    </div>
  );
}
