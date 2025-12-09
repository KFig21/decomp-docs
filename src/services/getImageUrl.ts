export function getImageUrl(files: Map<string, string>, path: string): string | null {
  const file = files.get(path);
  if (!file) return null;

  const blob = new Blob([file]);
  return URL.createObjectURL(blob);
}
