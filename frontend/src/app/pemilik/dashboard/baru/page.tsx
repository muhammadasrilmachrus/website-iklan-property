"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../shared/lib/api";
import type { Property } from "../../../../shared/lib/types";

export default function PropertiBaruPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    type: "RUMAH",
    listingType: "JUAL",
    price: "",
    priceUnit: "TOTAL",
    description: "",
    address: "",
    city: "",
    bedrooms: "",
    bathrooms: "",
    areaM2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const property = await apiFetch<Property>("/properties", { method: "POST", body: JSON.stringify(form) });
      router.push(`/pemilik/dashboard/${property.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan properti");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-3xl text-foreground">Tambah Properti</h1>
      <p className="mt-1 text-sm text-foreground-muted">Isi detail properti. Foto bisa diunggah setelah properti disimpan.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">Judul Properti</label>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Rumah Minimalis 2 Lantai di Kota Baru"
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
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan & Lanjut Unggah Foto"}
        </button>
      </form>
    </main>
  );
}