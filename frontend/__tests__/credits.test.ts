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
      expect(c.year).toMatch(/^\d{4}$/);
      expect(c.title).not.toBe("");
      expect(c.license).not.toBe("");
      expect(c.url).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });
});

describe("credits page", () => {
  it("is only reachable by its address: nothing in the app links to it", () => {
    const roots = ["app", "components"].map(d => path.join(__dirname, "..", d));
    const files: string[] = [];
    const walk = (dir: string) => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(e.name)) files.push(full);
    });
    roots.forEach(walk);
    const linking = files.filter(f => !/app\/(creditos|sitemap)/.test(f) && /href=["{`'][^"'`]*\/creditos/.test(fs.readFileSync(f, "utf8")));
    expect(linking).toEqual([]);
  });
});
