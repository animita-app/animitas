import { animitaHref } from '@/lib/routes'
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAnimitas } from "@/contexts/animitas-context";
import { searchLocation } from "@/lib/mapbox";
import { bboxPolygon, fetchBoundary } from "@/lib/area";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const AREA_TYPES = new Set(["region", "district", "place", "locality"]);
const KIND: Record<string, string> = { region: "región", district: "provincia", place: "comuna", locality: "localidad" };

// How a place reads on its plate: an area says what kind it is; a street says which comuna it's in, so
// "Recoleta" the comuna and "Recoleta" the street in Pudahuel don't look the same.
export function placeLabel(feature: { text: string; place_type?: string[]; context?: { id: string; text: string }[] }) {
  const kind = feature.place_type?.[0] ?? "";
  if (KIND[kind]) return `${feature.text} (${KIND[kind]})`;
  const comuna = feature.context?.find(c => c.id.startsWith("place."))?.text;
  return comuna && comuna !== feature.text ? `${feature.text}, ${comuna}` : feature.text;
}

export function useSearchLocation(onSearch?: (query: string) => void) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { flyTo, animitas, setArea } = useAnimitas();
  const router = useRouter();
  const pathname = usePathname();
  const debounceTimer = useRef<NodeJS.Timeout>();

  const resetSearch = useCallback(() => {
    // A search still waiting on its debounce would come back and reopen the results.
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSearchQuery("");
    onSearch?.("");
    setOpen(false);
    setSearchResults([]);
    setIsLoading(false);
  }, [onSearch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch?.(query);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.length >= 3) {
      setIsLoading(true);
      debounceTimer.current = setTimeout(async () => {
        const localResults = animitas.filter((site) =>
          site.title?.toLowerCase().includes(query.toLowerCase()) ||
          site.address?.toLowerCase().includes(query.toLowerCase()) ||
          site.city_region?.toLowerCase().includes(query.toLowerCase())
        ).map((site) => ({
          id: site.id,
          title: site.title,
          place_name: `${site.title}, ${site.city_region || ""}`,
          text: site.title,
          type: "local",
          geometry: {
            type: "Point",
            coordinates: [site.location.lng, site.location.lat],
          },
          properties: site,
        }));

        let mapboxResults: any[] = [];
        if (MAPBOX_TOKEN) {
          try {
            const features = await searchLocation(query, MAPBOX_TOKEN);
            mapboxResults = features
              .slice(0, 3)
              .map((feature: any) => ({
                id: feature.id,
                title: placeLabel(feature),
                place_name: feature.place_name,
                text: feature.text,
                type: "mapbox",
                geometry: feature.geometry,
                // Only places that are areas (a comuna, a city, a region) narrow the map; a street just flies there.
                bbox: AREA_TYPES.has(feature.place_type?.[0]) ? feature.bbox : undefined,
                center: feature.center,
              }));
          } catch (error) {
          }
        }

        // Animitas first, but never so many that the places (a comuna, a city) drop out of sight.
        const combined = [...localResults.slice(0, 4), ...mapboxResults];

        const seen = new Set<string>();
        const deduplicated = combined.filter((result) => {
          const key = result.place_name || result.title;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });

        setSearchResults(deduplicated);
        setOpen(true);
        setIsLoading(false);
      }, 300);
    } else {
      setOpen(false);
      setSearchResults([]);
      setIsLoading(false);
    }
  }, [animitas, onSearch]);

  const handleSelect = useCallback((result: any) => {
    if (result.type === "local" && result.properties) {
      router.push(animitaHref(result.properties.slug));
    } else {
      if (result.bbox) {
        // A comuna, city or region: it becomes the area the map and the list are narrowed to. The box
        // shows at once; the real outline replaces it when it arrives, if it's still the chosen place.
        const label = result.text || result.title || result.place_name
        setArea({ label, geometry: bboxPolygon(result.bbox) });
        fetchBoundary(result.place_name || label).then(geometry => {
          if (geometry) setArea(current => (current?.label === label ? { label, geometry } : current));
        });
      } else if (result.center) flyTo({ center: result.center });
      // A place only means something on the map; from any other page, go there and it flies on arrival.
      if (pathname !== "/map") router.push("/map");
    }
    resetSearch();
  }, [flyTo, router, resetSearch, pathname, setArea]);

  return {
    searchQuery,
    setSearchQuery,
    open,
    setOpen,
    isLoading,
    searchResults,
    handleSearch,
    handleSelect,
    resetSearch,
  };
}
