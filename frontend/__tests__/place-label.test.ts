import { placeLabel } from "@/hooks/use-search-location";

jest.mock("@/contexts/animitas-context", () => ({ useAnimitas: () => ({}) }));
jest.mock("next/navigation", () => ({ useRouter: () => ({}), usePathname: () => "/" }));

describe("placeLabel", () => {
  it("names an area by its kind", () => {
    expect(placeLabel({ text: "Recoleta", place_type: ["place"] })).toBe("Recoleta (comuna)");
    expect(placeLabel({ text: "Región de Coquimbo", place_type: ["region"] })).toBe("Región de Coquimbo (región)");
  });

  it("names a street by the comuna it's in, so same-named places don't look alike", () => {
    expect(placeLabel({ text: "Recoleta", place_type: ["address"], context: [{ id: "place.1", text: "Pudahuel" }] })).toBe("Recoleta, Pudahuel");
  });
});
