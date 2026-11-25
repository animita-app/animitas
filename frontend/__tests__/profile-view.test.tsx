import { render, screen } from "@testing-library/react";

let currentUser: { id: string } | null = null;
const order = jest.fn();
jest.mock("@/contexts/user-context", () => ({ useUser: () => ({ currentUser, setUser: jest.fn() }) }));
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ order }) }) }) }),
}));
jest.mock("sonner", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

import { ProfileView } from "@/app/profile/[username]/profile-view";

const profile = { id: "ana", display_name: "Ana", username: "ana", image: null, role: "default" };

describe("ProfileView", () => {
  beforeEach(() => order.mockResolvedValue({ data: [] }));

  it("invites you to add your first animita on your own profile", async () => {
    currentUser = { id: "ana" };
    render(<ProfileView profile={profile} />);
    expect(await screen.findByText("Todavía no añades animitas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Añadir" })).toHaveAttribute("href", "/add");
    expect(screen.getByRole("button", { name: "Cambiar foto" })).toBeInTheDocument();
  });

  it("shows someone else's empty profile without actions", async () => {
    currentUser = { id: "beto" };
    render(<ProfileView profile={profile} />);
    expect(await screen.findByText("Todavía no añade animitas")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Añadir" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cambiar foto" })).not.toBeInTheDocument();
  });

  it("does not show a Rutas tab", async () => {
    currentUser = null;
    render(<ProfileView profile={profile} />);
    await screen.findByText("Todavía no añade animitas");
    expect(screen.queryByText("Rutas")).not.toBeInTheDocument();
  });
});
