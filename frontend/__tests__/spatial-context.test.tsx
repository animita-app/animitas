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

const wrapper = ({ children }: { children: ReactNode }) => (
  <UserProvider>
    <SpatialProvider>{children}</SpatialProvider>
  </UserProvider>
);

describe("SpatialContext", () => {
  it("should initialize with no map target and no filters", () => {
    const { result } = renderHook(() => useSpatialContext(), { wrapper });
    expect(result.current.mapTarget).toBeNull();
    expect(result.current.filters).toEqual({});
  });

  it("should set a new map target each time flyTo is called with the same place", async () => {
    const { result } = renderHook(() => useSpatialContext(), { wrapper });

    await act(async () => {
      result.current.flyTo({ center: [-70.6, -33.4] });
    });
    const first = result.current.mapTarget;

    await act(async () => {
      result.current.flyTo({ center: [-70.6, -33.4] });
    });

    expect(result.current.mapTarget).toEqual({ center: [-70.6, -33.4] });
    expect(result.current.mapTarget).not.toBe(first);
  });

  it("reports an error when the animitas can't be loaded", async () => {
    const { createClient } = jest.requireMock("@/lib/supabase/client");
    createClient().from().select().eq.mockResolvedValueOnce({ data: null, error: { message: "fetch failed" } });
    const { result } = renderHook(() => useSpatialContext(), { wrapper });
    await act(async () => {});
    expect(result.current.sitesStatus).toBe("error");
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
