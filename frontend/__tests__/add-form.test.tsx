import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("mapbox-gl", () => ({
  __esModule: true,
  default: { Map: jest.fn(() => ({ on: jest.fn(), remove: jest.fn(), jumpTo: jest.fn(), getCenter: jest.fn(), touchZoomRotate: { disableRotation: jest.fn() } })) },
}));
jest.mock("mapbox-gl/dist/mapbox-gl.css", () => ({}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));
jest.mock("sonner", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));
jest.mock("@/contexts/user-context", () => ({ useUser: () => ({ currentUser: { id: "u1" } }) }));
jest.mock("@/lib/supabase/client", () => ({ createClient: jest.fn() }));

import { AddForm, validateAnimita } from "@/components/forms/add-form";

describe("validateAnimita", () => {
  const photo = new File(["x"], "a.jpg", { type: "image/jpeg" });

  it("asks for a photo, a place and a name", () => {
    expect(validateAnimita({ photos: [], location: null, name: "" })).toEqual({
      photos: "Añade al menos una foto",
      location: "Mueve el mapa hasta dejar el pin sobre la animita",
      name: "Escribe su nombre, al menos 3 letras",
    });
  });

  it("does not ask for a story", () => {
    expect(validateAnimita({ photos: [photo], location: { lat: -33.4, lng: -70.6 }, name: "Juanito" })).toEqual({});
  });
});

describe("AddForm", () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, "geolocation", { value: { getCurrentPosition: jest.fn() }, configurable: true });
    global.fetch = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
  });

  it("keeps Publicar enabled and shows what is missing inline instead of sending", () => {
    render(<AddForm />);
    const publish = screen.getByRole("button", { name: "Publicar" });
    expect(publish).toBeEnabled();

    fireEvent.click(publish);

    expect(screen.getByText("Añade al menos una foto")).toBeInTheDocument();
    expect(screen.getByText("Escribe su nombre, al menos 3 letras")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
