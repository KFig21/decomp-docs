import { useState } from 'react';
import ReactJson from 'react18-json-view';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import CopyButton from '../../../../components/elements/copyButton/CopyButton';
import './styles.scss';

export default function JsonDebug({ data }: { data: unknown }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`section pokemon-card-style json-debug-container ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <CollapseToggle isOpen={isOpen} />
          <span className="section-header-title">Debug JSON</span>
        </div>

        <CopyButton textToCopy={JSON.stringify(data, null, 2)} label="Copy JSON" />
      </div>

      {isOpen && (
        <div className="content">
          <ReactJson src={data as object} collapsed={2} enableClipboard={false} />
        </div>
      )}
    </div>
  );
}
