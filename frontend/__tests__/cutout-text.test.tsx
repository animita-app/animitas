import { render } from "@testing-library/react";
import { CutoutText } from "@/components/cutout-text";

const glyphs = (el: Element) => Array.from(el.querySelectorAll("img")).map(img => img.getAttribute("src")!);

describe("CutoutText", () => {
  it("has a cut for every letter and digit of a Spanish name", () => {
    const text = "abcdefghijklmnopqrstuvwxyz0123456789";
    const { container } = render(<CutoutText text={text} />);
    expect(glyphs(container)).toHaveLength(text.length);
  });

  it("glues an accent or a tilde on top of the base letter", () => {
    const { container } = render(<CutoutText text="ñá" />);
    const srcs = glyphs(container);
    expect(srcs[0]).toMatch(/\/letters\/n\//);
    expect(srcs[1]).toMatch(/\/letters\/tilde\//);
    expect(srcs[2]).toMatch(/\/letters\/a\//);
    expect(srcs[3]).toMatch(/\/letters\/dash\//);
  });

  it("skips spaces, and is hidden from screen readers", () => {
    const { container } = render(<CutoutText text="dónde está" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(glyphs(container).filter(s => !/dash/.test(s))).toHaveLength(9);
  });

  it("orbits the same letters around an object", () => {
    const { container } = render(<CutoutText text="entrar" orbit={{ radius: 80, angle: 130, clockwise: false }} />);
    expect(glyphs(container)).toHaveLength(6);
  });
});
