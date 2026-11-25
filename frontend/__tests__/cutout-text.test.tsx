import { render } from "@testing-library/react";
import { CutoutText, INKS, contrast } from "@/components/cutout-text";

describe("CutoutText", () => {
  it("gives every paper at least one ink that reads on it", () => {
    for (const [paper, inks] of Object.entries(INKS)) {
      expect(inks.length).toBeGreaterThan(0);
      for (const ink of inks) expect(contrast(paper, ink)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("cuts one tile per letter, skipping spaces, hidden from screen readers", () => {
    const { container } = render(<CutoutText text="dónde está" />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.textContent?.toLowerCase()).toBe("dóndeestá");
  });

  it("orbits the same letters around an object", () => {
    const { container } = render(<CutoutText text="entrar" orbit={{ radius: 80, angle: 130, clockwise: false }} />);
    expect(container.textContent?.toLowerCase()).toBe("entrar");
  });
});
