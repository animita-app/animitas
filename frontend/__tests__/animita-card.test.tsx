import { render, screen, fireEvent } from "@testing-library/react";
import { AnimitaCard } from "@/components/animita/animita-card";

describe("AnimitaCard", () => {
  it("names the link with the animita and its place, since the print shows no caption", () => {
    render(<AnimitaCard site={{ slug: "romualdo", title: "Animita de Romualdo", images: null, city_region: "Santiago" }} />);
    const link = screen.getByRole("link", { name: "Animita de Romualdo, Santiago" });
    expect(link).toHaveAttribute("href", expect.stringContaining("romualdo"));
    expect(screen.queryByText("Animita de Romualdo")).not.toBeInTheDocument();
  });

  it("names the link with the title alone when the place is unknown", () => {
    render(<AnimitaCard site={{ slug: "x", title: "Animita sin lugar", images: null }} />);
    expect(screen.getByRole("link", { name: "Animita sin lugar" })).toBeInTheDocument();
  });

  it("only cuts the letters of the name while someone reaches for the print", () => {
    const { container } = render(<AnimitaCard site={{ slug: "r", title: "Romualdo", images: null }} />);
    const link = screen.getByRole("link", { name: "Romualdo" });
    expect(container.querySelector("[aria-hidden]")).toBeNull();
    fireEvent.pointerEnter(link);
    expect(container.querySelector("[aria-hidden]")?.textContent?.toLowerCase()).toBe("romualdo");
    fireEvent.pointerLeave(link);
    expect(container.querySelector("[aria-hidden]")).toBeNull();
  });
});
