import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { countVelas } from "@/app/animita/[slug]/sections/info-sidebar-components/velas";

const deleteEq = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("sonner", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));
jest.mock("@/contexts/user-context", () => ({
  useUser: () => ({
    currentUser: { id: "user-1", name: "Ana", avatarUrl: null },
    isAuthenticated: true,
  }),
}));
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => ({
            data: [{ id: "c1", content: "Que descanse", created_at: new Date().toISOString(), user_id: "user-1", user_profiles: { display_name: "Ana" } }],
          }),
        }),
      }),
      delete: () => ({ eq: deleteEq }),
    }),
  }),
}));

import { CommentsSection } from "@/app/animita/[slug]/sections/info-sidebar-components/comments-section";

describe("countVelas", () => {
  it("counts one candle per person even with several old reactions", () => {
    const rows = [{ user_id: "a" }, { user_id: "a" }, { user_id: "b" }];
    expect(countVelas(rows, "a")).toEqual({ count: 2, isLit: true });
    expect(countVelas(rows, "c")).toEqual({ count: 2, isLit: false });
    expect(countVelas([], undefined)).toEqual({ count: 0, isLit: false });
  });
});

describe("CommentsSection", () => {
  it("keeps the comment on screen when deleting it fails", async () => {
    deleteEq.mockResolvedValueOnce({ error: { message: "sin conexión" } });
    render(<CommentsSection siteId="site-1" />);

    await screen.findByText("Que descanse");
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    fireEvent.click(await screen.findByRole("button", { name: "Eliminar comentario" }));

    await waitFor(() => expect(deleteEq).toHaveBeenCalledWith("id", "c1"));
    expect(screen.getByText("Que descanse")).toBeInTheDocument();
  });
});
