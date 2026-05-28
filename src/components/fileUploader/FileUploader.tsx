import { useState, useEffect, useRef } from 'react';
import './styles.scss';

type Props = {
  onUpload: (files: FileList) => void;
  folderName?: string;
  folderIsChosen?: boolean;
  disabled?: boolean;
};

export default function FileUploader({ onUpload, folderName, folderIsChosen, disabled }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [dots, setDots] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Set webkitdirectory attribute (React doesn't natively support it on the input element well)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.webkitdirectory = true;
    }
  }, []);

  // Handle the trailing ellipsis animation
  useEffect(() => {
    if (!isUploading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDots(''); // Reset dots when done
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400); // Speed of the animated dots

    return () => clearInterval(interval);
  }, [isUploading]);

  // Native cancel event listener for when user closes file dialog without selecting
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleCancel = () => setIsUploading(false);
    input.addEventListener('cancel', handleCancel);
    return () => input.removeEventListener('cancel', handleCancel);
  }, []);

  const handleClick = () => {
    // HACK TO BEAT THE BROWSER FREEZE:
    // When the user clicks the input, the OS file dialog opens.
    // When they make a selection, the dialog closes and the window regains focus.
    // We trigger the loading state right at the focus event, BEFORE the browser starts
    // enumerating 15,000 files and locking up the main thread.
    const handleFocus = () => {
      setIsUploading(true);
      window.removeEventListener('focus', handleFocus);
    };
    window.addEventListener('focus', handleFocus);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
    setIsUploading(false); // Reset when finished
  };

  const isDisabled = disabled || isUploading;

  return (
    <div className={`file-uploader ${isDisabled ? 'disabled' : ''}`}>
      <div className="container">
        <label className={`file-upload-label ${isDisabled ? 'disabled' : ''}`}>
          {isUploading ? (
            <span className="uploading-text">
              Uploading project<span className="dots">{dots}</span>
            </span>
          ) : folderIsChosen ? (
            `${folderName}`
          ) : (
            'Select your decomp folder'
          )}
          <input
            type="file"
            multiple
            disabled={isDisabled}
            ref={inputRef}
            onClick={handleClick}
            onChange={handleChange}
          />
        </label>
      </div>
    </div>
  );
}
