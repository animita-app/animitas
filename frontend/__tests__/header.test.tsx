import { render, screen } from "@testing-library/react";

let pathname = "/map";
let modalSegment: string | null = null;

jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSelectedLayoutSegment: () => modalSegment,
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("@/contexts/user-context", () => ({
  useUser: () => ({ currentUser: null, isLoading: false }),
}));
jest.mock("@/components/search/road-sign-search", () => ({
  RoadSignSearch: () => <input aria-label="Buscar una animita o un lugar" />,
}));
jest.mock("@/components/headers/main-header-panel", () => ({
  MainHeaderPanel: () => <nav aria-label="Navegación principal" />,
}));

import { Header } from "@/components/headers/header";

describe("Header", () => {
  beforeEach(() => {
    pathname = "/map";
    modalSegment = null;
  });

  it("shows the main navigation and the road-sign search on the map", () => {
    render(<Header />);
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar una animita o un lugar" })).toBeInTheDocument();
  });

  it("hides on the full animita page", () => {
    pathname = "/animita/juanito";
    const { container } = render(<Header />);
    expect(container).toBeEmptyDOMElement();
  });

  it("stays on top of the map when the animita opens as a sheet", () => {
    pathname = "/animita/juanito";
    modalSegment = "(.)animita";
    render(<Header />);
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
  });
});
