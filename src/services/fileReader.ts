// src/services/fileReader.ts

// Define a union type for our file content
export type FileContent = string | ArrayBuffer | Blob;

export async function readFolderFiles(files: FileList): Promise<Map<string, FileContent>> {
  const map = new Map<string, FileContent>();

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const path = f.webkitRelativePath || f.name;
    const ext = path.split('.').pop()?.toLowerCase();

    // Determine how to read the file based on extension
    if (ext === 'png') {
      map.set(path, f); // Keep as File/Blob for images
    } else if (ext === 'bin') {
      const buffer = await f.arrayBuffer();
      map.set(path, buffer);
    } else {
      // Default to text for code, json, etc.
      const text = await f.text();
      map.set(path, text);
    }
  }

  return map;
}
