import { areaBounds, bboxPolygon, pointInArea } from "@/lib/area";

describe("area", () => {
  const box = bboxPolygon([-70.6, -33.5, -70.5, -33.4]);

  it("knows which animitas fall inside a box", () => {
    expect(pointInArea(-70.55, -33.45, box)).toBe(true);
    expect(pointInArea(-70.7, -33.45, box)).toBe(false);
  });

  it("respects holes and multiple parts of an outline", () => {
    const multi = {
      type: "MultiPolygon" as const,
      coordinates: [
        [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]], [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]],
        [[[20, 20], [22, 20], [22, 22], [20, 22], [20, 20]]],
      ],
    };
    expect(pointInArea(2, 2, multi)).toBe(true);
    expect(pointInArea(5, 5, multi)).toBe(false);
    expect(pointInArea(21, 21, multi)).toBe(true);
    expect(pointInArea(15, 15, multi)).toBe(false);
  });

  it("frames an outline by its bounds", () => {
    expect(areaBounds(box)).toEqual([-70.6, -33.5, -70.5, -33.4]);
  });
});
