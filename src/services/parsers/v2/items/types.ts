export type ItemLocation = {
  location: string;
  map: string;
  quantity: number;
  method: 'overworld' | 'hidden' | 'npc' | 'mart';
  //   repeatable: boolean; maybe add later
};
