import { render, screen, fireEvent } from "@testing-library/react";

let pathname = "/map";
const requestReset = jest.fn();
jest.mock("next/navigation", () => ({ usePathname: () => pathname }));
jest.mock("@/contexts/animitas-context", () => ({ useAnimitas: () => ({ requestReset }) }));
jest.mock("next/image", () => ({ __esModule: true, default: () => null }));

import { MainHeaderPanel } from "@/components/headers/main-header-panel";

describe("MainHeaderPanel", () => {
  beforeEach(() => requestReset.mockClear());

  it("on the map, the map object brings all of Chile back without navigating", () => {
    pathname = "/map";
    render(<MainHeaderPanel />);
    const event = fireEvent.click(screen.getByRole("link", { name: "Mapa" }));
    expect(requestReset).toHaveBeenCalledTimes(1);
    expect(event).toBe(false);
  });

  it("from an animita's sheet, it closes the sheet and brings all of Chile back", () => {
    pathname = "/animita/juanito";
    render(<MainHeaderPanel />);
    fireEvent.click(screen.getByRole("link", { name: "Mapa" }));
    expect(requestReset).toHaveBeenCalledTimes(1);
  });

  it("from the list, it just goes to the map", () => {
    pathname = "/list";
    render(<MainHeaderPanel />);
    fireEvent.click(screen.getByRole("link", { name: "Mapa" }));
    expect(requestReset).not.toHaveBeenCalled();
  });
});
