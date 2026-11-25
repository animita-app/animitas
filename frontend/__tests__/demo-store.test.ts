import { seedSite, type DemoData } from "@/lib/demo/store";

jest.mock("@/lib/demo/flag", () => ({ DEMO_USER: { id: "visita" }, readDemoSession: () => null }));

const fresh = (): DemoData => ({ profiles: [], velas: [], comments: [], animitas: [], patches: {}, seeded: {}, adopted: [] });

describe("demo seeding", () => {
  it("spreads candles and recuerdos so every state shows up across animitas", () => {
    const data = fresh();
    const ids = Array.from({ length: 60 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`);
    ids.forEach(id => seedSite(data, id));
    const candles = new Set(ids.map(id => new Set(data.velas.filter(v => v.site_id === id).map(v => v.user_id)).size));
    const notes = new Set(ids.map(id => data.comments.filter(c => c.site_id === id).length));
    expect(candles.has(0)).toBe(true);
    expect(candles.has(1)).toBe(true);
    expect([...candles].some(n => n > 20)).toBe(true);
    expect(notes.has(0)).toBe(true);
    expect([...notes].some(n => n > 5)).toBe(true);
  });

  it("makes the same history every time for the same animita", () => {
    const a = fresh(); const b = fresh();
    seedSite(a, "romualdito-id"); seedSite(b, "romualdito-id");
    expect(a.velas.length).toBe(b.velas.length);
    expect(a.comments.map(c => c.content)).toEqual(b.comments.map(c => c.content));
  });
});
