import { render, act, renderHook } from "@testing-library/react";
import { UserProvider, useUser } from "@/contexts/user-context";
import { ROLES } from "@/types/roles";
import { ReactNode } from "react";

jest.mock("@/lib/supabase/client", () => {
  const createQueryBuilder = () => {
    const builder: any = {};
    builder.select = jest.fn(() => builder);
    builder.eq = jest.fn(() => builder);
    builder.insert = jest.fn(() => builder);
    builder.update = jest.fn(() => builder);
    builder.single = jest.fn(async () => ({ data: null, error: null }));
    return builder;
  };

  const mockSubscription = { unsubscribe: jest.fn() };

  const mockSupabaseClient = {
    auth: {
      getSession: jest.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn((callback: any) => {
        callback("INITIAL_SESSION", null);
        return { data: { subscription: mockSubscription } };
      }),
    },
    from: jest.fn(() => createQueryBuilder()),
  };

  return {
    createClient: () => mockSupabaseClient,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});


const wrapper = ({ children }: { children: ReactNode }) => (
  <UserProvider>{children}</UserProvider>
);

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("UserContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it("should initialize with default role", async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await flushAsync();
    });

    expect(result.current.role).toBe(ROLES.DEFAULT);
    expect(result.current.researchMode).toBe(false);
  });

  it("should allow changing role", async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      result.current.setUser({
        id: "user-1",
        name: "Tester",
        email: "tester@example.com",
        role: ROLES.DEFAULT,
        avatarUrl: undefined,
      });
      await flushAsync();
    });

    expect(result.current.currentUser?.id).toBe("user-1");

    await act(async () => {
      result.current.setRole(ROLES.EDITOR);
      await flushAsync();
    });

    expect(result.current.role).toBe(ROLES.EDITOR);
  });

  it("should allow toggling researchMode", async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      result.current.setResearchMode(true);
      await flushAsync();
    });

    expect(result.current.researchMode).toBe(true);
    expect(localStorageMock.getItem("research_mode")).toBe("true");
  });
});
