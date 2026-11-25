import { animitaHref } from '@/lib/routes'
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnimitas } from "@/contexts/animitas-context";
import { searchLocation } from "@/lib/mapbox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export function useSearchLocation(onSearch?: (query: string) => void) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { flyTo, animitas } = useAnimitas();
  const router = useRouter();
  const debounceTimer = useRef<NodeJS.Timeout>();

  const resetSearch = useCallback(() => {
    setSearchQuery("");
    onSearch?.("");
    setOpen(false);
  }, [onSearch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch?.(query);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.length >= 3) {
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
                title: feature.place_name,
                place_name: feature.place_name,
                text: feature.text,
                type: "mapbox",
                geometry: feature.geometry,
                bbox: feature.bbox,
                center: feature.center,
              }));
          } catch (error) {
          }
        }

        const combined = [...localResults, ...mapboxResults];

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
    } else if (result.bbox) {
      flyTo({ bbox: result.bbox });
    } else if (result.center) {
      flyTo({ center: result.center });
    }
    resetSearch();
  }, [flyTo, router, resetSearch]);

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
