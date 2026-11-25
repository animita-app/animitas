import { animitaHref } from "@/lib/routes";

const nextConfig = require("../next.config.js");

describe("animita routes", () => {
  it("builds the detail URL under /animita", () => {
    expect(animitaHref("juanito-perez")).toBe("/animita/juanito-perez");
  });

  it("redirects the old heritage kind URLs to /animita", async () => {
    const redirects = await nextConfig.redirects();
    expect(redirects).toContainEqual({
      source: "/santuarios/:slug",
      destination: "/animita/:slug",
      permanent: true,
    });
  });
});
