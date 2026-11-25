import { useCallback } from "react";
import { CHILE_BOUNDS } from "./use-map-initialization";

const PROFILE_ZOOM_THRESHOLD = 12;
const TARGET_ZOOM = 17;

interface UseMapEventsProps {
  map: mapboxgl.Map | null;
}

export function useMapEvents({ map }: UseMapEventsProps) {
  const focusAnimita = useCallback(
    (
      coordinates: [number, number],
      options?: { instant?: boolean },
    ) => {
      const instant = options?.instant ?? false;
      if (!map) {
        return;
      }

      const padding = { top: 0, bottom: 0, left: 0, right: 0 };

      map.resize();

      if (instant) {
        map.jumpTo({
          center: coordinates,
          zoom: TARGET_ZOOM,
          bearing: map.getBearing(),
          pitch: map.getPitch(),
          padding,
        });
      } else {
        const currentZoom = map.getZoom();
        const canViewProfile = currentZoom >= PROFILE_ZOOM_THRESHOLD;

        if (!canViewProfile) {
          map.flyTo({
            center: coordinates,
            zoom: TARGET_ZOOM,
            speed: 4,
            curve: 1,
            padding,
            essential: true,
          });
        } else {
          map.easeTo({
            center: coordinates,
            zoom: Math.max(currentZoom, TARGET_ZOOM - 1),
            duration: 150,
            bearing: map.getBearing(),
            pitch: map.getPitch(),
            padding,
            essential: true,
          });
        }
      }
    },
    [map],
  );

  const resetView = useCallback(() => {
    if (!map) {
      return;
    }

    const camera = map.cameraForBounds(CHILE_BOUNDS, {
      padding: { top: 48, bottom: 48, left: 48, right: 48 },
    });

    if (camera) {
      map.flyTo({
        ...camera,
        duration: 2000,
        essential: true,
      });
    } else {
      map.fitBounds(CHILE_BOUNDS, {
        padding: 64,
        essential: true,
        duration: 2000,
      });
    }
  }, [map]);

  return { focusAnimita, resetView };
}
