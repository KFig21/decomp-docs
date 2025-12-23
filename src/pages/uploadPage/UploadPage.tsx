/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../../components/fileUploader/FileUploader';
import { readFolderFiles } from '../../services/fileReader';
import { parseDecompV2 } from '../../services/parsers/v2';
import './styles.scss';

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;

  setLocations: (l: any[]) => void;
  setPokemon: (p: any[]) => void;
  setItems: (i: any[]) => void;
  setTrainers: (t: any[]) => void;
};

export default function UploadPage({
  projectName,
  setProjectName,
  setLocations,
  setPokemon,
  setItems,
  setTrainers,
}: Props) {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [folderIsChosen, setFolderIsChosen] = useState(false);
  const [loading, setLoading] = useState(false);

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
    const result = parseDecompV2(files);

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

        <div className="upload-container">
          <FileUploader
            onUpload={handleUpload}
            folderName={projectName}
            folderIsChosen={folderIsChosen}
          />
        </div>
        <div className="button-container">
          <button
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
