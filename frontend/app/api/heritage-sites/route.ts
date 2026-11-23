import { NextResponse } from "next/server";
import { heritageSitePayloadSchema } from "@/lib/validators/heritage-site";
import { slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type HeritageSiteRow = {
  id: string;
  slug: string;
};

async function ensureUniqueSlug(
  supabase: SupabaseClient,
  baseSlug: string,
): Promise<string> {
  let attempt = 0;
  let candidate = baseSlug;

  while (true) {
    const { data, error } = await supabase
      .from("heritage_sites")
      .select("slug")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }

    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Debe iniciar sesión para registrar una animita." },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = heritageSitePayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const {
    name,
    story,
    location,
    isPublic,
    images,
  } = parsed.data;

  const baseSlug = slugify(name);
  let slug = await ensureUniqueSlug(supabase, baseSlug);
  const geom = `SRID=4326;POINT(${location.lng} ${location.lat})`;

  const payload = {
    title: name,
    story,
    slug,
    location: geom,
    address: location.address || null,
    city_region: location.cityRegion || null,
    images: images || [],
    status: isPublic ? "published" : "draft",
    creator_id: user.id,
  };

  let { data, error } = await supabase
    .from("heritage_sites")
    .insert(payload)
    .select("id, slug")
    .single();

  // Drafts by other people are hidden by RLS, so ensureUniqueSlug can miss them.
  for (let retry = 0; error?.code === "23505" && retry < 3; retry++) {
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    ({ data, error } = await supabase
      .from("heritage_sites")
      .insert({ ...payload, slug })
      .select("id, slug")
      .single());
  }

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "No se pudo guardar" }, { status: 400 });
  }

  return NextResponse.json(
    {
      success: true,
      slug: data.slug,
    },
    { status: 201 },
  );
}
