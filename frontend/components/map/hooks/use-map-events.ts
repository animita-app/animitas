import { useCallback } from "react";
import { CHILE_BOUNDS, CHILE_PADDING } from "./use-map-initialization";

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

      // The animita's sheet covers part of the map (the bottom half on a phone, the right side on a wide
      // screen), so it's centered in what stays visible.
      const phone = window.innerWidth < 640;
      const padding = phone
        ? { top: 72, bottom: Math.round(window.innerHeight * 0.55), left: 0, right: 0 }
        : { top: 0, bottom: 0, left: 0, right: Math.min(512, window.innerWidth * 0.4) };

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

    const camera = map.cameraForBounds(CHILE_BOUNDS, { padding: CHILE_PADDING });

    if (camera) {
      map.flyTo({
        ...camera,
        duration: 2000,
        essential: true,
      });
    } else {
      map.fitBounds(CHILE_BOUNDS, {
        padding: CHILE_PADDING,
        essential: true,
        duration: 2000,
      });
    }
  }, [map]);

  return { focusAnimita, resetView };
}
