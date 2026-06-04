import { useState } from 'react';
import ReactJson from 'react18-json-view';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import './styles.scss';

export default function JsonDebug({ data }: { data: unknown }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling when clicking the button
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert('JSON copied to clipboard!');
  };

  return (
    <div className={`section pokemon-card-style json-debug-container ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <CollapseToggle isOpen={isOpen} />
          <span className="section-header-title">Debug JSON</span>
        </div>

        {/* Added button inside header */}
        <button className="copy-btn" onClick={handleCopy}>
          Copy JSON
        </button>
      </div>

      {isOpen && (
        <div className="content">
          <ReactJson
            src={data as object}
            collapsed={2}
            // displayDataTypes={false}
            enableClipboard={false}
          />
        </div>
      )}
    </div>
  );
}
