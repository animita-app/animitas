import { render, screen, fireEvent } from "@testing-library/react";

const handleSelect = jest.fn();
const results = [
  { id: "1", type: "local", title: "Romualdito", place_name: "Romualdito" },
  { id: "2", type: "mapbox", text: "Roma", place_name: "Roma, Chile" },
];
jest.mock("@/hooks/use-search-location", () => ({
  useSearchLocation: () => ({ open: true, setOpen: jest.fn(), searchResults: results, handleSearch: jest.fn(), handleSelect, resetSearch: jest.fn() }),
}));

jest.mock("@/contexts/animitas-context", () => ({ useAnimitas: () => ({ setQuery: jest.fn(), area: null, setArea: jest.fn() }) }));

import { RoadSignSearch } from "@/components/search/road-sign-search";

describe("RoadSignSearch", () => {
  beforeEach(() => handleSelect.mockClear());

  it("shows results as destination plates and picks one with the keyboard", () => {
    render(<RoadSignSearch />);
    const input = screen.getByRole("combobox");
    expect(screen.getAllByRole("option").map(o => o.textContent)).toEqual(["Romualdito", "Roma"]);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleSelect).toHaveBeenCalledWith(results[1]);
  });

  it("Enter with nothing highlighted takes the first plate", () => {
    render(<RoadSignSearch />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(handleSelect).toHaveBeenCalledWith(results[0]);
  });
});
