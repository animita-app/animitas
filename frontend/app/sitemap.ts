import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [sitesRes, routesRes] = await Promise.all([
    supabase
      .from("heritage_sites")
      .select("slug, heritage_kinds!kind_id(slug), updated_at")
      .eq("status", "published")
      .limit(1000),
    supabase
      .from("site_routes")
      .select("id, updated_at")
      .limit(1000),
  ]);

  const siteEntries: MetadataRoute.Sitemap = (sitesRes.data || []).map((
    site: any,
  ) => ({
    url: `https://anima.lat/${
      site.heritage_kinds?.slug || "animita"
    }/${site.slug}`,
    lastModified: new Date(site.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const routeEntries: MetadataRoute.Sitemap = (routesRes.data || []).map((
    route: any,
  ) => ({
    url: `https://anima.lat/rutas/${route.id}`,
    lastModified: new Date(route.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: "https://anima.lat",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://anima.lat/map",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://anima.lat/list",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://anima.lat/add",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [...staticPages, ...siteEntries, ...routeEntries];
}
