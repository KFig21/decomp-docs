// src/utils/dom.ts
export const toSafeId = (str: string) => str.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
