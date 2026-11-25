import { zoomIntoCluster } from "@/components/map/layers/marker-layer";

jest.mock("mapbox-gl", () => ({}));

describe("zoomIntoCluster", () => {
  it("still flies to the cluster after Mapbox has cleared the event's features", async () => {
    const flyTo = jest.fn();
    let answer: (err: unknown, zoom: number) => void = () => {};
    const map: any = {
      flyTo,
      getSource: () => ({ getClusterExpansionZoom: (_id: number, cb: typeof answer) => { answer = cb } }),
    };
    const event: any = { features: [{ properties: { cluster_id: 7 }, geometry: { type: "Point", coordinates: [-70.6, -33.4] } }] };

    zoomIntoCluster(map, "memorials")(event);
    // Mapbox removes the features once the listener returns; the zoom comes back afterwards.
    delete event.features;
    answer(null, 9);

    expect(flyTo).toHaveBeenCalledWith(expect.objectContaining({ center: [-70.6, -33.4], zoom: 9 }));
  });

  it("does nothing when the click carries no cluster", () => {
    const map: any = { flyTo: jest.fn(), getSource: jest.fn() };
    zoomIntoCluster(map, "memorials")({});
    expect(map.getSource).not.toHaveBeenCalled();
  });
});
