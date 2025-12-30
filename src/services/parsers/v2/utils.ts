// src/services/parsers/v2/utils.ts
import type { FileContent } from '../../fileReader';

export function getFile(files: Map<string, FileContent>, endsWith: string): string | null {
  for (const [path, content] of files.entries()) {
    if (path.endsWith(endsWith)) {
      if (typeof content === 'string') return content;
      return null; // or throw error if we expected text but got binary
    }
  }
  return null;
}

export function getFileBuffer(
  files: Map<string, FileContent>,
  endsWith: string,
): ArrayBuffer | null {
  for (const [path, content] of files.entries()) {
    if (path.endsWith(endsWith)) {
      if (content instanceof ArrayBuffer) return content;
      return null;
    }
  }
  return null;
}

export function getFileBlob(files: Map<string, FileContent>, endsWith: string): Blob | null {
  for (const [path, content] of files.entries()) {
    if (path.endsWith(endsWith)) {
      if (content instanceof Blob) return content;
      return null;
    }
  }
  return null;
}
