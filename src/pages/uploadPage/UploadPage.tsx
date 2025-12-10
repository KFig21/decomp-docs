/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../../components/fileUploader/FileUploader';
import { readFolderFiles } from '../../services/fileReader';
import { parseDecomp } from '../../services/parsers/v1/index';
import type { Location } from '../../types/decomp';
import './styles.scss';

type Props = {
  setLocations: (locs: Location[]) => void;
  projectName: string;
  setProjectName: (name: string) => void;
};

export default function UploadPage({ setLocations, projectName, setProjectName }: Props) {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [folderIsChosen, setFolderIsChosen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // new state

  const handleUpload = async (files: FileList) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      const path = (files[0] as any).webkitRelativePath || files[0].name;
      const name = path.split('/')[0];
      setProjectName(name);
      setFolderIsChosen(true);
    }
  };

  const handleParse = async () => {
    if (!uploadedFiles || loading) return;
    setLoading(true); // start loader

    const map = await readFolderFiles(uploadedFiles);
    const locations = parseDecomp(map);

    setLocations(locations);
    navigate('/locations');
  };

  return (
    <div className="upload-page">
      <div className="main-container">
        <h1>Decomp-Docs</h1>
        <div className="upload-container">
          <FileUploader
            onUpload={handleUpload}
            folderName={projectName || ''}
            folderIsChosen={folderIsChosen}
          />
        </div>
        <div className="button-container">
          <button
            className={folderIsChosen ? 'enabled' : 'disabled'}
            onClick={handleParse}
            disabled={!folderIsChosen || loading} // prevent multiple clicks
          >
            {loading ? <span className="spinner"></span> : 'Parse'}
          </button>
        </div>
      </div>
    </div>
  );
}
