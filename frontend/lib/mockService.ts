import { MOCK_ANIMITAS } from "@/constants/mockData";
import type { Animita } from "@/types/mock";

export async function getAllAnimitas(): Promise<Animita[]> {
  return MOCK_ANIMITAS;
}

export async function getAnimitaById(id: string): Promise<Animita | null> {
  return MOCK_ANIMITAS.find((animita) => animita.id === id) || null;
}

export async function getAnimitasForMap(): Promise<
  Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    image?: string;
  }>
> {
  return MOCK_ANIMITAS.map((animita) => ({
    id: animita.id,
    name: animita.name,
    lat: animita.lat,
    lng: animita.lng,
    image: animita.images[0],
  }));
}
