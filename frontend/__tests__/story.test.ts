import { storyExcerpt } from "@/lib/story";

describe("storyExcerpt", () => {
  it("keeps a short story whole", () => {
    expect(storyExcerpt("Murió en la curva. La cuidan sus vecinos.")).toEqual({ text: "Murió en la curva. La cuidan sus vecinos.", more: false });
  });

  it("stops at the last whole sentence that fits", () => {
    const story = "Primera frase corta. Segunda frase también corta. " + "Una tercera frase muy larga que ya no cabe ".repeat(10);
    expect(storyExcerpt(story, 60)).toEqual({ text: "Primera frase corta. Segunda frase también corta.", more: true });
  });

  it("cuts a single long sentence at a word, never mid-word", () => {
    const { text, more } = storyExcerpt("palabra ".repeat(80), 50);
    expect(more).toBe(true);
    expect(text.endsWith("palabra…")).toBe(true);
    expect(text.length).toBeLessThanOrEqual(51);
  });

  it("handles a missing story", () => {
    expect(storyExcerpt(null)).toEqual({ text: "", more: false });
  });
});
