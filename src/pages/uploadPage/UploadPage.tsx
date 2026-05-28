/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../../components/fileUploader/FileUploader';
import { readFolderFiles } from '../../services/fileReader';
import { parseDecompV2 } from '../../services/parsers/v2';
import './styles.scss';
import { useData } from '../../contexts/dataContext';
import ProgressBar from '../../components/elements/progressBar/ProgressBar';
import ProgressLog from '../../components/elements/progressLog/ProgressLog';

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;
};

export default function UploadPage({ projectName, setProjectName }: Props) {
  const { setLocations, setPokemon, setItems, setTrainers } = useData();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [folderIsChosen, setFolderIsChosen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderMaps, setRenderMaps] = useState(false);
  const parseButtonRef = useRef<HTMLButtonElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const cancelRef = useRef(false); // Cancellation ref to interrupt the parser safely

  useEffect(() => {
    if (folderIsChosen && !loading) {
      parseButtonRef.current?.focus();
    }
  }, [folderIsChosen, loading]);

  const handleUpload = async (files: FileList) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      const path = (files[0] as any).webkitRelativePath || files[0].name;
      setProjectName(path.split('/')[0]);
      setFolderIsChosen(true);
    }
  };

  const handleParse = async () => {
    if (!uploadedFiles || loading) return;
    setLoading(true);
    setProgress(0);
    setProgressText('Initializing...');
    setLogs(['Initializing parser...']);
    cancelRef.current = false; // Reset cancel state

    const handleProgress = (text: string, percent: number) => {
      setProgressText(text);
      setProgress(percent);
      setLogs((prevLogs) => {
        const lastLog = prevLogs[prevLogs.length - 1] || '';
        if (lastLog.startsWith('Reading files') && text.startsWith('Reading files')) {
          return [...prevLogs.slice(0, -1), text];
        }
        if (lastLog === text) {
          return prevLogs;
        }
        return [...prevLogs, text];
      });
    };

    const checkCancel = () => cancelRef.current;

    try {
      // DYNAMIC WEIGHTING:
      // If maps are rendering, reading files takes ~5% of total time.
      // If maps are NOT rendering, reading files takes ~50% of total time.
      const readWeight = renderMaps ? 0.05 : 0.5;
      const parseWeight = 1 - readWeight;

      // 1. Read Files
      const files = await readFolderFiles(
        uploadedFiles,
        (text, pct) => handleProgress(text, pct * readWeight),
        checkCancel,
      );

      // 2. Parse Data
      const result = await parseDecompV2(
        files,
        renderMaps,
        (text, pct) => handleProgress(text, readWeight * 100 + pct * parseWeight),
        checkCancel,
      );

      setLocations(result.locations);
      setPokemon(result.pokemon);
      setItems(result.items);
      setTrainers(result.trainers);
      navigate('/locations');
    } catch (err: any) {
      if (err.message === 'CANCELLED') {
        setLogs((prev) => [...prev, 'Parser stopped by user.']);
        setLoading(false);
        setProgressText('Cancelled');
      } else {
        setLogs((prev) => [...prev, `Error: ${err.message}`]);
        setLoading(false);
        setProgressText('Error');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setLogs((prev) => [...prev, 'Cancelling parser... please wait.']);
  };

  return (
    <div className="upload-page">
      <div className="main-container">
        <h1>Decomp-Docs</h1>
        {/* UPLOAD CONTAINER */}
        <div className="upload-container">
          <FileUploader
            onUpload={handleUpload}
            folderName={projectName}
            folderIsChosen={folderIsChosen}
            disabled={loading}
          />
        </div>
        {/* MAPS CHECKBOX */}
        <div className="maps-checkbox-container">
          <label className="maps-checkbox">
            <input
              type="checkbox"
              checked={renderMaps}
              onChange={(e) => setRenderMaps(e.target.checked)}
              disabled={loading}
            />
            <div>Render map images (slow)</div>
          </label>
        </div>
        {/* PARSE BUTTON */}
        <div className="button-container">
          <button
            ref={parseButtonRef}
            className={folderIsChosen ? 'enabled' : 'disabled'}
            onClick={handleParse}
            disabled={!folderIsChosen || loading}
          >
            {loading ? <span className="spinner" /> : 'Parse'}
          </button>
        </div>
        {/* PROGRESS BAR & LOGS */}
        {loading && (
          <div className="parsing-feedback-container">
            <ProgressBar progress={progress} text={progressText} />
            <ProgressLog logs={logs} />
            <button className="cancel-button" onClick={handleCancel}>
              Cancel Parsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
