export function getFile(files: Map<string, string>, endsWith: string) {
  for (const [path, content] of files.entries()) {
    if (path.endsWith(endsWith)) return content;
  }
  return null;
}
