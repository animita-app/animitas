export type StickerType = "flower" | "candle" | "rose" | "heart" | "cross";
export type PetitionState = "activa" | "cumplida" | "expirada";
export type PetitionDuration = "1 dia" | "3 dias" | "7 dias";

export interface Sticker {
  id: string;
  type: StickerType;
  date: string;
  userId: string;
  message?: string | null;
}

export interface Petition {
  id: string;
  texto: string;
  fecha: string;
  duracion: PetitionDuration;
  estado: PetitionState;
}

export interface Animita {
  id: string;
  name: string;
  lat: number;
  lng: number;
  story: string;
  deathDate: string;
  birthDate: string;
  biography: string;
  images: string[];
  material: Sticker[];
  peticiones: Petition[];
  createdAt: string;
  isPublic: boolean;
}

export interface UserSticker {
  animitaId: string;
  sticker: Sticker;
}

export interface UserPetition {
  animitaId: string;
  petition: Petition;
}
