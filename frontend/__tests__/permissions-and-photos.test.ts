import { canEditAnimita } from "@/lib/animitas";
import { uploadAnimitaPhoto, uploadAvatar } from "@/lib/photos";

describe("canEditAnimita", () => {
  const animita = { creator_id: "ana" };

  it("lets the person who added it edit", () => {
    expect(canEditAnimita({ id: "ana" }, false, animita)).toBe(true);
  });

  it("lets editors edit anyone's animita", () => {
    expect(canEditAnimita({ id: "beto" }, true, animita)).toBe(true);
  });

  it("does not let other people or visitors edit", () => {
    expect(canEditAnimita({ id: "beto" }, false, animita)).toBe(false);
    expect(canEditAnimita(null, true, animita)).toBe(false);
  });
});

describe("photo uploads", () => {
  function storage(error: { message: string } | null = null) {
    const upload = jest.fn(async () => ({ error }));
    const supabase: any = {
      storage: { from: jest.fn(() => ({ upload, getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn/${path}` } }) })) },
    };
    return { supabase, upload };
  }
  const file = new File(["x"], "Foto.JPG", { type: "image/jpeg" });

  it("puts animita photos and avatars in the bucket that exists", async () => {
    const { supabase } = storage();
    await uploadAnimitaPhoto(supabase, "ana", file);
    await uploadAvatar(supabase, "ana", file);
    expect(supabase.storage.from.mock.calls.every(([bucket]: [string]) => bucket === "base")).toBe(true);
  });

  it("stores the avatar in a fixed place and busts the cache", async () => {
    const { supabase, upload } = storage();
    const url = await uploadAvatar(supabase, "ana", file);
    expect(upload).toHaveBeenCalledWith("users/ana/avatar", file, expect.objectContaining({ upsert: true }));
    expect(url).toMatch(/^https:\/\/cdn\/users\/ana\/avatar\?t=\d+$/);
  });

  it("says which file failed", async () => {
    const { supabase } = storage({ message: "too big" });
    await expect(uploadAnimitaPhoto(supabase, "ana", file)).rejects.toThrow("No se pudo subir Foto.JPG");
  });
});
