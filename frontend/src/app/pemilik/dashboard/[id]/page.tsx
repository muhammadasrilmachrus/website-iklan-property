"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../shared/lib/api";
import type { Photo, Property } from "../../../../shared/lib/types";

type LoadState = "loading" | "ok" | "fail";

interface FormState {
  title: string;
  type: string;
  listingType: string;
  price: string;
  priceUnit: string;
  description: string;
  address: string;
  city: string;
  bedrooms: string | number;
  bathrooms: string | number;
  areaM2: string | number;
  isActive: boolean;
}

export default function KelolaPropertiPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [form, setForm] = useState<FormState | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    apiFetch<Property>(`/my/properties/${params.id}`)
      .then((data) => {
        setForm({
          title: data.title,
          type: data.type,
          listingType: data.listingType,
          price: String(data.price),
          priceUnit: data.priceUnit,
          description: data.description,
          address: data.address,
          city: data.city,
          bedrooms: data.bedrooms ?? "",
          bathrooms: data.bathrooms ?? "",
          areaM2: data.areaM2 ?? "",
          isActive: data.isActive,
        });
        setPhotos(data.photos);
        setState("ok");
      })
      .catch(() => setState("fail"));
  }, [params.id]);

  function update(field: keyof FormState, value: string | boolean) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiFetch(`/properties/${params.id}`, { method: "PUT", body: JSON.stringify(form) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload() {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      Array.from(files).forEach((file) => data.append("photos", file));
      const newPhotos = await apiFetch<Photo[]>(`/properties/${params.id}/photos`, { method: "POST", body: data });
      setPhotos((prev) => [...prev, ...newPhotos]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto(id: string) {
    await apiFetch(`/photos/${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleDeleteProperty() {
    if (!confirm("Hapus properti ini beserta semua fotonya?")) return;
    await apiFetch(`/properties/${params.id}`, { method: "DELETE" });
    router.push("/pemilik/dashboard");
  }

  if (state === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="h-60 animate-pulse rounded-2xl bg-border" />
      </main>
    );
  }
  if (state === "fail" || !form) {
    return <main className="mx-auto max-w-2xl px-4 py-16 text-center text-foreground-muted">Properti tidak ditemukan.</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-foreground">Kelola Properti</h1>
        <button onClick={handleDeleteProperty} className="text-sm font-medium text-red-600 hover:underline">
          Hapus Properti
        </button>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-medium text-foreground">Foto Properti</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-background">
              <img src={`/api${photo.url}`} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="text-sm text-foreground-muted" />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {uploading ? "Mengunggah..." : "Unggah Foto"}
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-border bg-surface p-5">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} />
          Tampilkan properti ini di pencarian publik
        </label>
        <div>
          <label className="block text-sm font-medium text-foreground">Judul Properti</label>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Jenis Properti</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            >
              <option value="RUMAH">Rumah</option>
              <option value="KOST">Kost</option>
              <option value="RUKO">Ruko</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Jenis Penawaran</label>
            <select
              value={form.listingType}
              onChange={(e) => update("listingType", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            >
              <option value="JUAL">Dijual</option>
              <option value="SEWA">Disewakan</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Harga (Rp)</label>
            <input
              required
              type="number"
              min="1"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Satuan Harga</label>
            <select
              value={form.priceUnit}
              onChange={(e) => update("priceUnit", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            >
              <option value="TOTAL">Total</option>
              <option value="PER_BULAN">Per Bulan</option>
              <option value="PER_TAHUN">Per Tahun</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Alamat</label>
          <input
            required
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Kota</label>
          <input
            required
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Kamar Tidur</label>
            <input
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Kamar Mandi</label>
            <input
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Luas (m²)</label>
            <input
              type="number"
              min="0"
              value={form.areaM2}
              onChange={(e) => update("areaM2", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Deskripsi</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </main>
  );
}