import './styles.scss';

type Props = {
  onUpload: (files: FileList) => void;
  folderName?: string;
  folderIsChosen?: boolean;
};

export default function FileUploader({ onUpload, folderName, folderIsChosen }: Props) {
  return (
    <div className="file-uploader">
      <div className="container">
        <label className="file-upload-label">
          {folderIsChosen ? `${folderName}` : 'Select your decomp folder'}
          <input
            type="file"
            multiple
            ref={(input) => {
              if (input) input.webkitdirectory = true;
            }}
            onChange={(e) => {
              if (e.target.files) onUpload(e.target.files);
            }}
          />
        </label>
      </div>
    </div>
  );
}
