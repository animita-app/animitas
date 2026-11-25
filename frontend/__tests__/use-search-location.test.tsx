import { renderHook, act } from "@testing-library/react";

const push = jest.fn();
let pathname = "/list";
const flyTo = jest.fn();
const animitas = Array.from({ length: 8 }, (_, i) => ({
  id: `a${i}`, slug: `a${i}`, title: `Animita ${i}`, city_region: "Coquimbo", address: "", location: { lat: -30, lng: -71 },
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => pathname }));
const setArea = jest.fn();
jest.mock("@/contexts/animitas-context", () => ({ useAnimitas: () => ({ flyTo, animitas, setArea }) }));
jest.mock("@/lib/area", () => ({ ...jest.requireActual("@/lib/area"), fetchBoundary: jest.fn(async () => null) }));
jest.mock("@/lib/mapbox", () => ({
  searchLocation: jest.fn(async () => [{ id: "p1", place_name: "Coquimbo, Chile", text: "Coquimbo", center: [-71.3, -29.9] }]),
}));
jest.mock("@/lib/routes", () => ({ animitaHref: (slug: string) => `/animita/${slug}` }));

const ORIGINAL_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = "test";
import { useSearchLocation } from "@/hooks/use-search-location";
afterAll(() => { process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = ORIGINAL_TOKEN; });

describe("useSearchLocation", () => {
  beforeEach(() => { jest.useFakeTimers(); push.mockClear(); flyTo.mockClear(); pathname = "/list"; });
  afterEach(() => jest.useRealTimers());

  it("keeps a place among the results when many animitas match", async () => {
    const { result } = renderHook(() => useSearchLocation());
    act(() => result.current.handleSearch("coquimbo"));
    await act(async () => { await jest.advanceTimersByTimeAsync(300); });
    const types = result.current.searchResults.map(r => r.type);
    expect(types.filter(t => t === "local")).toHaveLength(4);
    expect(types).toContain("mapbox");
  });

  it("a search cancelled with Escape does not come back", async () => {
    const { result } = renderHook(() => useSearchLocation());
    act(() => result.current.handleSearch("coquimbo"));
    act(() => result.current.resetSearch());
    await act(async () => { await jest.advanceTimersByTimeAsync(300); });
    expect(result.current.open).toBe(false);
    expect(result.current.searchResults).toEqual([]);
  });

  it("picking a place from another page goes to the map, which flies there", () => {
    const { result } = renderHook(() => useSearchLocation());
    act(() => result.current.handleSelect({ type: "mapbox", center: [-71.3, -29.9] }));
    expect(flyTo).toHaveBeenCalledWith({ center: [-71.3, -29.9] });
    expect(push).toHaveBeenCalledWith("/map");
  });

  it("picking a place on the map just flies", () => {
    pathname = "/map";
    const { result } = renderHook(() => useSearchLocation());
    act(() => result.current.handleSelect({ type: "mapbox", center: [-71.3, -29.9] }));
    expect(push).not.toHaveBeenCalled();
  });

  it("choosing a comuna narrows to it as an area, instead of only flying there", () => {
    pathname = "/map";
    const { result } = renderHook(() => useSearchLocation());
    act(() => result.current.handleSelect({ type: "mapbox", text: "Vitacura", place_name: "Vitacura, Chile", bbox: [-70.6, -33.4, -70.5, -33.3] }));
    expect(setArea).toHaveBeenCalledWith(expect.objectContaining({ label: "Vitacura" }));
    expect(flyTo).not.toHaveBeenCalled();
  });
});
