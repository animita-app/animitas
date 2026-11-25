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

  it("keeps the whole word readable while its letters are recut one by one", () => {
    const { act } = require("react");
    const { container } = render(<CutoutText text="cargando" glue />);
    const srcs = () => glyphs(container);
    const before = srcs();
    expect(before).toHaveLength(8);
    let changed = 0;
    for (let t = 0; t < 2000; t += 100) {
      act(() => { jest.advanceTimersByTime(100); });
      expect(srcs()).toHaveLength(8);
      changed = srcs().filter((src, i) => src !== before[i]).length;
    }
    expect(changed).toBeGreaterThan(0);
  });
});
