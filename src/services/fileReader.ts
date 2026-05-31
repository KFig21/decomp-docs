export type FileContent = string | ArrayBuffer | Blob;

// Folders we definitely don't need to read into memory
const IGNORED_FOLDERS = ['.git', 'build', 'sound', 'tools', 'asm'];

// Allowed extensions (png for maps, bin for palettes, json/h/c/inc for text/data, pal for color palettes, party for trainer parties)
const ALLOWED_EXTENSIONS = ['h', 'c', 'json', 'inc', 'png', 'bin', 'pal', 'party'];

export async function readFolderFiles(
  files: FileList,
  onProgress?: (text: string, percent: number) => void,
  checkCancel?: () => boolean, // <-- Added
): Promise<Map<string, FileContent>> {
  const map = new Map<string, FileContent>();
  const total = files.length;
  let processed = 0;

  for (let i = 0; i < total; i++) {
    if (checkCancel?.()) throw new Error('CANCELLED'); // <-- Bail out early

    const f = files[i];
    const path = f.webkitRelativePath || f.name;

    processed++;

    // Throttle progress updates to avoid freezing the UI thread
    if (onProgress && processed % 100 === 0) {
      const percent = Math.round((processed / total) * 100);
      onProgress(`Reading files (${processed}/${total})...`, percent);
    }

    // Optimization: Skip unnecessary folders
    const pathParts = path.split('/');
    if (pathParts.some((part) => IGNORED_FOLDERS.includes(part))) {
      continue;
    }

    // Optimization: Skip unnecessary file extensions
    const ext = path.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      continue;
    }

    if (ext === 'png') {
      map.set(path, f);
    } else if (ext === 'bin') {
      map.set(path, await f.arrayBuffer());
    } else {
      map.set(path, await f.text());
    }
  }

  if (onProgress) onProgress(`Finished reading ${total} files.`, 100);

  return map;
}
