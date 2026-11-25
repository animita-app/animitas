import { renderHook, act } from "@testing-library/react";
import { AnimitasProvider, useAnimitas } from "@/contexts/animitas-context";
import { ReactNode } from "react";

const rows = [
  { id: "1", slug: "a", title: "Juanito", status: "published", city_region: "Talca", location: { type: "Point", coordinates: [-71.6, -35.4] } },
  { id: "2", slug: "b", title: "Rosita", status: "published", city_region: "Arica", location: { type: "Point", coordinates: [-70.3, -18.5] } },
  { id: "3", slug: "c", title: "Sin lugar", status: "published", city_region: "Arica", location: null },
];

const eq = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: () => ({ select: () => ({ eq }) }) }),
}));

const wrapper = ({ children }: { children: ReactNode }) => <AnimitasProvider>{children}</AnimitasProvider>;

async function renderLoaded() {
  const hook = renderHook(() => useAnimitas(), { wrapper });
  await act(async () => {});
  return hook;
}

describe("AnimitasContext", () => {
  beforeEach(() => eq.mockResolvedValue({ data: rows, error: null }));

  it("loads published animitas and skips the ones without a location", async () => {
    const { result } = await renderLoaded();
    expect(result.current.status).toBe("ready");
    expect(result.current.animitas.map(a => a.title)).toEqual(["Juanito", "Rosita"]);
  });

  it("keeps every comuna as an option after one is selected", async () => {
    const { result } = await renderLoaded();
    await act(async () => result.current.setSelectedComunas(["Talca"]));
    expect(result.current.animitas.map(a => a.title)).toEqual(["Juanito"]);
    expect(result.current.comunas).toEqual(["Arica", "Talca"]);
  });

  it("reports an error and recovers on reload", async () => {
    eq.mockResolvedValueOnce({ data: null, error: { message: "fetch failed" } });
    const { result } = await renderLoaded();
    expect(result.current.status).toBe("error");
    await act(async () => result.current.reload());
    expect(result.current.status).toBe("ready");
  });

  it("sets a new map target each time, even for the same place", async () => {
    const { result } = await renderLoaded();
    await act(async () => result.current.flyTo({ center: [-70.6, -33.4] }));
    const first = result.current.mapTarget;
    await act(async () => result.current.flyTo({ center: [-70.6, -33.4] }));
    expect(result.current.mapTarget).toEqual(first);
    expect(result.current.mapTarget).not.toBe(first);
  });
});
