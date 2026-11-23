jest.mock("next/og", () => ({ ImageResponse: jest.fn() }));

import manifest from "@/app/manifest";

describe("PWA manifest", () => {
  it("opens the map as an installed app with regular and maskable icons", () => {
    const m = manifest();
    expect(m.start_url).toBe("/map");
    expect(m.display).toBe("standalone");
    expect(m.icons?.map(i => i.purpose)).toEqual(["any", "any", "maskable"]);
  });
});
