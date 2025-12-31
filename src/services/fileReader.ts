// src/services/fileReader.ts
export type FileContent = string | ArrayBuffer | Blob;

export async function readFolderFiles(files: FileList): Promise<Map<string, FileContent>> {
  const map = new Map<string, FileContent>();

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const path = f.webkitRelativePath || f.name;
    const ext = path.split('.').pop()?.toLowerCase();

    if (ext === 'png') {
      map.set(path, f);
    } else if (ext === 'bin') {
      // Add .pal if your project uses binary palettes
      map.set(path, await f.arrayBuffer());
    } else {
      // Default to text for json, c, h, inc, pal (JASC-PAL)
      map.set(path, await f.text());
    }
  }

  return map;
}
