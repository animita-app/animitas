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

describe("CutoutText as a loader", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("glues the whole word before any letter peels off, then starts over", () => {
    const { act } = require("react");
    const { container } = render(<CutoutText text="cargando" glue />);
    const glued = () => container.querySelectorAll('[data-glued="true"]').length;
    const seen: number[] = [];
    for (let t = 0; t < 4000; t += 50) {
      act(() => { jest.advanceTimersByTime(50); });
      seen.push(glued());
    }
    const firstPeel = seen.findIndex((n, i) => i > 0 && n < seen[i - 1]);
    expect(Math.max(...seen.slice(0, firstPeel))).toBe(8);
    expect(seen.slice(firstPeel).some(n => n === 8)).toBe(true);
  });
});
