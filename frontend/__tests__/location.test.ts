import { directionsUrl, normalizeLocation } from "@/lib/location";

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
