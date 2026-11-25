import { render, screen, fireEvent } from "@testing-library/react";

const setSelectedComunas = jest.fn();
let selected: string[] = [];
jest.mock("@/contexts/animitas-context", () => ({
  useAnimitas: () => ({ comunas: ["Arica", "Talca"], selectedComunas: selected, setSelectedComunas }),
}));

import { ComunaFilter } from "@/components/comuna-filter";

describe("ComunaFilter", () => {
  beforeEach(() => { setSelectedComunas.mockClear(); selected = []; });

  it("is reachable on the list with an accessible name", () => {
    render(<ComunaFilter />);
    expect(screen.getByRole("button", { name: "Filtrar por comuna" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ver todas las comunas" })).not.toBeInTheDocument();
  });

  it("names the chosen comuna and lets you clear it", () => {
    selected = ["Talca"];
    render(<ComunaFilter />);
    expect(screen.getByRole("button", { name: "Comuna: Talca" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ver todas las comunas" }));
    expect(setSelectedComunas).toHaveBeenCalledWith([]);
  });
});
