import { renderHook, act } from "@testing-library/react";
import { SpatialProvider, useSpatialContext } from "@/contexts/spatial-context";
import { UserProvider } from "@/contexts/user-context";
import { ReactNode } from "react";

// Mock Supabase
jest.mock("@/lib/supabase/client", () => {
  const queryBuilder: any = {
    select: jest.fn(() => queryBuilder),
    eq: jest.fn(async () => ({ data: [], error: null })),
  };

  const mockSupabase = {
    auth: {
      getSession: jest.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn((callback: any) => {
        callback("INITIAL_SESSION", null);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
    },
    from: jest.fn(() => queryBuilder),
  };

  return {
    createClient: () => mockSupabase,
  };
});

// Mock Turf
jest.mock("@turf/turf", () => ({
  featureCollection: (f: any) => ({ type: "FeatureCollection", features: f }),
  point: (c: any, p: any) => ({ type: "Feature", geometry: { type: "Point", coordinates: c }, properties: p }),
  booleanPointInPolygon: () => true,
}));

// Mock GIS Engine
jest.mock("@/lib/gis-engine", () => ({
  clipFeatures: (p: any) => p,
}));


const wrapper = ({ children }: { children: ReactNode }) => (
  <UserProvider>
    <SpatialProvider>{children}</SpatialProvider>
  </UserProvider>
);

describe("SpatialContext", () => {
  it("should initialize with empty active area and filters", () => {
    const { result } = renderHook(() => useSpatialContext(), { wrapper });
    expect(result.current.activeArea).toBeNull();
    expect(result.current.filters).toEqual({});
  });

  it("should update filters", async () => {
    const { result } = renderHook(() => useSpatialContext(), { wrapper });

    await act(async () => {
      result.current.setFilter("typology", ["Gruta"]);
    });

    expect(result.current.filters.typology).toEqual(["Gruta"]);
  });

  it("should clear filters", async () => {
    const { result } = renderHook(() => useSpatialContext(), { wrapper });

    await act(async () => {
      result.current.setFilter("typology", ["Gruta"]);
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
  });
});
