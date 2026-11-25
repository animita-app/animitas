import fs from "fs";
import path from "path";
import { OBJECT_CREDITS } from "@/lib/credits";

describe("object credits", () => {
  it("credits every object photo the interface shows, with author, license and link", () => {
    const dir = path.join(__dirname, "../public/cutouts");
    // An object cut into parts (the trash can's lid and body) is still one photo with one credit.
    const objects = new Set(fs.readdirSync(dir).filter(f => f.endsWith(".png")).map(f => f.replace(/-(lid|body)\.png$/, ".png")));
    expect(objects.size).toBe(OBJECT_CREDITS.length);
    for (const c of OBJECT_CREDITS) {
      expect(c.author).not.toBe("");
      expect(c.license).not.toBe("");
      expect(c.url).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });
});
