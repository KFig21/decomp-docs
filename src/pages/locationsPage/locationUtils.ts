export const sanitizeMapId = (name: string) =>
  `loc-map-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

export const sectionId = (mapId: string, section: string) => `${mapId}-${section}`;

export type SectionKey = 'map' | 'trainers' | 'encounters' | 'items' | 'mart';

export const SECTION_LABELS: Record<SectionKey, string> = {
  map: 'Map',
  trainers: 'Trainers',
  encounters: 'Encounters',
  items: 'Items',
  mart: 'Mart',
};

export type SectionNavEntry = {
  key: SectionKey;
  sectionId: string;
  label: string;
};

export type MapNavEntry = {
  mapId: string;
  label: string;
  sections: SectionNavEntry[];
};
