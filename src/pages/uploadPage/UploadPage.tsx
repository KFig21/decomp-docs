/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../../components/fileUploader/FileUploader';
import { readFolderFiles } from '../../services/fileReader';
import { parseDecompV2 } from '../../services/parsers/v2';
import { useData } from '../../contexts/dataContext';
import ProgressBar from '../../components/elements/progressBar/ProgressBar';
import ProgressLog from '../../components/elements/progressLog/ProgressLog';
import './styles.scss';

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;
};

export default function UploadPage({ projectName, setProjectName }: Props) {
  const { setLocations, setPokemon, setItems, setTrainers, setMoves, setAbilities, setNatures, setWeathers } =
    useData();

  const navigate = useNavigate();
  const parseButtonRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef(false);

  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [folderIsChosen, setFolderIsChosen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderMaps, setRenderMaps] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (folderIsChosen && !loading) {
      parseButtonRef.current?.focus();
    }
  }, [folderIsChosen, loading]);

  const handleUpload = (files: FileList) => {
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
    cancelRef.current = false;

    const handleProgress = (text: string, percent: number) => {
      setProgressText(text);
      setProgress(percent);
      setLogs((prev) => {
        const last = prev[prev.length - 1] ?? '';
        if (last.startsWith('Reading files') && text.startsWith('Reading files'))
          return [...prev.slice(0, -1), text];
        if (last === text) return prev;
        return [...prev, text];
      });
    };

    const checkCancel = () => cancelRef.current;

    try {
      const readWeight = renderMaps ? 0.05 : 0.5;
      const parseWeight = 1 - readWeight;

      const files = await readFolderFiles(
        uploadedFiles,
        (text, pct) => handleProgress(text, pct * readWeight),
        checkCancel,
      );

      const result = await parseDecompV2(
        files,
        renderMaps,
        (text, pct) => handleProgress(text, readWeight * 100 + pct * parseWeight),
        checkCancel,
      );

      // ── Push everything into DataContext ──────────────────────────────────
      setLocations(result.locations);
      setPokemon(result.pokemon);
      setItems(result.items);
      setTrainers(result.trainers);
      setMoves(result.moves);
      setAbilities(result.abilities);
      setNatures(result.natures ?? {});
      setWeathers(result.weathers ?? {});
      navigate('/locations');
    } catch (err: any) {
      if (err.message === 'CANCELLED') {
        setLogs((prev) => [...prev, 'Parser stopped by user.']);
        setProgressText('Cancelled');
      } else {
        setLogs((prev) => [...prev, `Error: ${err.message}`]);
        setProgressText('Error');
        console.error(err);
      }
      setLoading(false);
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setLogs((prev) => [...prev, 'Cancelling parser… please wait.']);
  };

  return (
    <div className="upload-page">
      <div className="main-container">
        <h1>Decomp-Docs</h1>

        <div className="upload-container">
          <FileUploader
            onUpload={handleUpload}
            folderName={projectName}
            folderIsChosen={folderIsChosen}
            disabled={loading}
          />
        </div>

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
