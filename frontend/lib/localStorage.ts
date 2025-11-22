import type { Sticker, Petition } from "@/types/mock";

const STICKERS_KEY = "animitas_stickers";
const PETITIONS_KEY = "animitas_petitions";
const USER_ID_KEY = "animitas_user_id";

function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function getUserId(): string {
  return getOrCreateUserId();
}

export interface StoredSticker extends Sticker {
  animitaId: string;
}

export interface StoredPetition extends Petition {
  animitaId: string;
}

// STICKERS
export function addSticker(
  animitaId: string,
  type: Sticker["type"],
  message?: string
): StoredSticker {
  const userId = getUserId();
  const sticker: StoredSticker = {
    id: `sticker-${Date.now()}`,
    animitaId,
    type,
    date: new Date().toISOString().split("T")[0],
    userId,
    message: message || null,
  };

  const stickers = getAllUserStickers();
  stickers.push(sticker);
  localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));

  return sticker;
}

export function getAllUserStickers(): StoredSticker[] {
  if (typeof window === "undefined") return [];

  const stickers = localStorage.getItem(STICKERS_KEY);
  return stickers ? JSON.parse(stickers) : [];
}

export function getAnimitaStickersByUser(animitaId: string): StoredSticker[] {
  const userId = getUserId();
  return getAllUserStickers().filter(
    (s) => s.animitaId === animitaId && s.userId === userId
  );
}

export function deleteSticker(stickerId: string): void {
  const stickers = getAllUserStickers().filter((s) => s.id !== stickerId);
  localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));
}

// PETITIONS
export function addPetition(
  animitaId: string,
  texto: string,
  duracion: Petition["duracion"]
): StoredPetition {
  const petition: StoredPetition = {
    id: `petition-${Date.now()}`,
    animitaId,
    texto,
    fecha: new Date().toISOString().split("T")[0],
    duracion,
    estado: "activa",
  };

  const petitions = getAllUserPetitions();
  petitions.push(petition);
  localStorage.setItem(PETITIONS_KEY, JSON.stringify(petitions));

  return petition;
}

export function getAllUserPetitions(): StoredPetition[] {
  if (typeof window === "undefined") return [];

  const petitions = localStorage.getItem(PETITIONS_KEY);
  return petitions ? JSON.parse(petitions) : [];
}

export function getAnimitaPetitionsByUser(animitaId: string): StoredPetition[] {
  const userId = getUserId();
  return getAllUserPetitions().filter((p) => p.animitaId === animitaId);
}

export function updatePetitionState(
  petitionId: string,
  estado: Petition["estado"]
): void {
  const petitions = getAllUserPetitions().map((p) =>
    p.id === petitionId ? { ...p, estado } : p
  );
  localStorage.setItem(PETITIONS_KEY, JSON.stringify(petitions));
}

export function deletePetition(petitionId: string): void {
  const petitions = getAllUserPetitions().filter((p) => p.id !== petitionId);
  localStorage.setItem(PETITIONS_KEY, JSON.stringify(petitions));
}
