export type StickerType = "heart" | "candle" | "teddy" | "rose" | "colo-colo" | "u-de-chile" | "swanderers";
export type PetitionState = "activa" | "cumplida" | "expirada";
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
  estado: PetitionState;
  userId: string;
  reactions: Sticker[];
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
  stickers: Sticker[]; // Renamed/Added to match usage
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
