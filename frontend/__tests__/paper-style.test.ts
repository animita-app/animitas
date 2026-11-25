import { warmGray } from "@/components/map/paper-style";

describe("warmGray", () => {
  it("turns the style's white background into the app's paper", () => {
    expect(warmGray("#fcfcfc")).toBe("rgb(239, 233, 221)");
  });

  it("keeps the gray's lightness but warms it", () => {
    expect(warmGray("rgb(186, 186, 186)")).toBe("rgb(185, 180, 169)");
  });

  it("leaves real colors alone", () => {
    expect(warmGray("hsl(230, 57%, 64%)")).toBeNull();
    expect(warmGray("#0000ee")).toBeNull();
    expect(warmGray(["get", "color"])).toBeNull();
  });
});
