export async function readFolderFiles(files: FileList): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const text = await f.text();
    map.set(f.webkitRelativePath || f.name, text);
  }

  return map;
}
