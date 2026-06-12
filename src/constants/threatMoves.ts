/** Sentinel value meaning "match any threat move" */
export const THREAT_MOVE_ALL = '__all__';

export const THREAT_MOVE_OPTIONS = [
  // OHKO
  { value: 'fissure', label: 'Fissure' },
  { value: 'guillotine', label: 'Guillotine' },
  { value: 'horndrill', label: 'Horn Drill' },
  { value: 'sheercold', label: 'Sheer Cold' },
  // Trapping
  { value: 'meanlook', label: 'Mean Look' },
  { value: 'block', label: 'Block' },
  { value: 'spiderweb', label: 'Spider Web' },
  // Sacrifice / perish
  { value: 'selfdestruct', label: 'Self-Destruct' },
  { value: 'explosion', label: 'Explosion' },
  { value: 'destinybond', label: 'Destiny Bond' },
  { value: 'perishsong', label: 'Perish Song' },
  // Counter
  { value: 'counter', label: 'Counter' },
  { value: 'mirrorcoat', label: 'Mirror Coat' },
  // Misc
  { value: 'metronome', label: 'Metronome' },
];

export const THREAT_MOVE_COLOR = '#c0392b';

/** Lowercase, strip spaces and hyphens — matches trainer page normalization */
export function normalizeThreatMoveName(name: string): string {
  return name.toLowerCase().replace(/[\s-]/g, '');
}
