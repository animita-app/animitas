import { directionsUrl, normalizeLocation, shortAddress } from "@/lib/location";

describe("normalizeLocation", () => {
  it("reads a GeoJSON point as lng, lat", () => {
    expect(normalizeLocation({ type: "Point", coordinates: [-70.65, -33.45] })).toEqual({ lat: -33.45, lng: -70.65 });
  });

  it("keeps a plain lat/lng object", () => {
    expect(normalizeLocation({ lat: -33.45, lng: -70.65 })).toEqual({ lat: -33.45, lng: -70.65 });
  });

  it("returns null when there is no usable location", () => {
    expect(normalizeLocation(null)).toBeNull();
    expect(normalizeLocation("0101000020E6100000")).toBeNull();
  });
});

describe("directionsUrl", () => {
  it("points Google Maps directions to the animita", () => {
    expect(directionsUrl({ lat: -33.45, lng: -70.65 })).toBe("https://www.google.com/maps/dir/?api=1&destination=-33.45,-70.65");
  });
});

describe("normalizeLocation with the new schema", () => {
  it("falls back to the generated lat/lng columns when PostgREST returns WKB", () => {
    const row = { location: "0101000020E6100000", lat: -33.45, lng: -70.65 };
    expect(normalizeLocation(row.location) ?? normalizeLocation(row)).toEqual({ lat: -33.45, lng: -70.65 });
  });
});

describe("shortAddress", () => {
  it("keeps the place and the comuna, without region, postal code or country", () => {
    expect(shortAddress("Victoria 59, Santiago, Santiago Metropolitan Region 8320000, Chile")).toBe("Victoria 59, Santiago");
    expect(shortAddress("Ruta 5 Norte, Coquimbo, Región de Coquimbo 1780000, Chile")).toBe("Ruta 5 Norte, Coquimbo");
    expect(shortAddress("Isla Dawson, Punta Arenas, Región de Magallanes y de la Antártica Chilena, Chile")).toBe("Isla Dawson, Punta Arenas");
  });

  it("falls back to the neighborhood when there is no address", () => {
    expect(shortAddress(null, "La Pirámide")).toBe("La Pirámide");
    expect(shortAddress(undefined, null)).toBe("");
  });
});
