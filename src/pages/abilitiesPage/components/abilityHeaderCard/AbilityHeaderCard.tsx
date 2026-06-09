/* eslint-disable @typescript-eslint/no-explicit-any */
import './styles.scss';

type Props = { ability: any };

export default function AbilityHeaderCard({ ability }: Props) {
  return (
    <div className="ability-header-card">
      <div className="ability-header-name">{ability.name || ability.key}</div>
      <div className={`ability-header-description${!ability.description ? ' ability-header-description--empty' : ''}`}>
        {ability.description || 'No description available.'}
      </div>
    </div>
  );
}
