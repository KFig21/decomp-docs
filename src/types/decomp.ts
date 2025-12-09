export type TrainerPokemon = {
  name: string;
  level: number;
  moves: string[];
};

export type Trainer = {
  name: string;
  party?: TrainerPokemon[];
  class: string;
  sprite?: string;
  items?: string[];
};

export type WildPokemon = {
  species: string;
  level: string;
  rate?: number;
};

export type Item = {
  name: string;
  location?: string;
};

export type Location = {
  id: string;
  name: string;
  trainers: Trainer[];
  wildPokemon: WildPokemon[];
  items: Item[];
};
