"use client";

import { useEffect, useState } from "react";
import PropertyCard from "../shared/components/PropertyCard";
import { apiFetch } from "../shared/lib/api";
import type { Property } from "../shared/lib/types";

type LoadState = "loading" | "ok" | "fail";

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [type, setType] = useState("");
  const [listingType, setListingType] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (listingType) params.set("listingType", listingType);
    if (city) params.set("city", city);
    const query = params.toString();
    apiFetch<Property[]>(`/properties${query ? `?${query}` : ""}`, { signal: controller.signal })
      .then((data) => {
        setProperties(data);
        setState("ok");
      })
      .catch(() => setState("fail"));
    return () => controller.abort();
  }, [type, listingType, city]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-12">
        <p className="text-sm uppercase tracking-widest text-primary-foreground/70">Rumah • Kost • Ruko</p>
        <h1 className="mt-3 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
          Temukan properti yang pas untuk kebutuhanmu
        </h1>
        <p className="mt-4 max-w-lg text-primary-foreground/80">
          Jelajahi rumah, kost, dan ruko yang dijual maupun disewakan langsung dari pemiliknya.
        </p>
      </section>

      <section className="-mt-8 flex flex-wrap gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">Semua jenis</option>
          <option value="RUMAH">Rumah</option>
          <option value="KOST">Kost</option>
          <option value="RUKO">Ruko</option>
        </select>
        <select
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">Dijual & disewakan</option>
          <option value="JUAL">Dijual</option>
          <option value="SEWA">Disewakan</option>
        </select>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Cari kota..."
          className="min-w-[160px] flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
        />
      </section>

      <section className="mt-8">
        {state === "loading" && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-border" />
            ))}
          </div>
        )}
        {state === "fail" && (
          <p className="rounded-xl border border-border bg-surface p-8 text-center text-foreground-muted">
            Gagal memuat properti. Coba muat ulang halaman.
          </p>
        )}
        {state === "ok" && properties.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-8 text-center text-foreground-muted">
            Belum ada properti yang cocok. Coba ubah filter pencarian.
          </p>
        )}
        {state === "ok" && properties.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}