import { matchesQuery } from "@/lib/animitas";

const romualdo = { title: "Romualdito", address: "Calle San Borja 50", city_region: "Estación Central" };

describe("matchesQuery", () => {
  it("narrows by name, address or comuna, ignoring accents and case", () => {
    expect(matchesQuery(romualdo, "romu")).toBe(true);
    expect(matchesQuery(romualdo, "borja")).toBe(true);
    expect(matchesQuery(romualdo, "estacion")).toBe(true);
    expect(matchesQuery(romualdo, "Valparaíso")).toBe(false);
  });

  it("keeps everything until there is enough to search for", () => {
    expect(matchesQuery(romualdo, "")).toBe(true);
    expect(matchesQuery(romualdo, "x")).toBe(true);
  });
});
