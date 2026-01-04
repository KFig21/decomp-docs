/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../../components/fileUploader/FileUploader';
import { readFolderFiles } from '../../services/fileReader';
import { parseDecompV2 } from '../../services/parsers/v2';
import './styles.scss';
import { useData } from '../../contexts/dataContext';

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

    const files = await readFolderFiles(uploadedFiles);

    const result = await parseDecompV2(files, renderMaps);

    setLocations(result.locations);
    setPokemon(result.pokemon);
    setItems(result.items);
    setTrainers(result.trainers);

    navigate('/locations');
  };

  return (
    <div className="upload-page">
      <div className="main-container">
        <h1>Decomp-Docs</h1>
        {/* Upload container */}
        <div className="upload-container">
          <FileUploader
            onUpload={handleUpload}
            folderName={projectName}
            folderIsChosen={folderIsChosen}
          />
        </div>
        {/* Render maps checkbox */}
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
        {/* Parse button */}
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
      </div>
    </div>
  );
}
