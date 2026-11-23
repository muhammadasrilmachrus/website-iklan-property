"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../shared/lib/api";
import { useAuth } from "../../../shared/lib/auth";
import type { Property } from "../../../shared/lib/types";
import { formatPrice, typeLabel, listingLabel } from "../../../shared/lib/format";

type LoadState = "loading" | "ok" | "fail";

export default function DashboardPage() {
  const router = useRouter();
  const { owner, isReady } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    if (!isReady) return;
    if (!owner) {
      router.replace("/pemilik/masuk");
      return;
    }
    apiFetch<Property[]>("/my/properties")
      .then((data) => {
        setProperties(data);
        setState("ok");
      })
      .catch(() => setState("fail"));
  }, [isReady, owner, router]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus properti ini? Foto yang sudah diunggah juga akan terhapus.")) return;
    await apiFetch(`/properties/${id}`, { method: "DELETE" });
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }

  if (!isReady || state === "loading") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-60 animate-pulse rounded-2xl bg-border" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Properti Saya</h1>
          <p className="mt-1 text-sm text-foreground-muted">Kelola iklan, foto, dan harga properti kamu.</p>
        </div>
        <Link
          href="/pemilik/dashboard/baru"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
        >
          + Tambah Properti
        </Link>
      </div>

      {state === "fail" && (
        <p className="mt-8 rounded-xl border border-border bg-surface p-8 text-center text-foreground-muted">
          Gagal memuat data. Coba muat ulang halaman.
        </p>
      )}

      {state === "ok" && properties.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-foreground-muted">Belum ada properti. Mulai dengan menambahkan properti pertamamu.</p>
        </div>
      )}

      {state === "ok" && properties.length > 0 && (
        <div className="mt-8 space-y-3">
          {properties.map((property) => (
            <div key={property.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4">
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-background">
                {property.photos[0] ? (
                  <img src={`/api${property.photos[0].url}`} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{property.title}</p>
                <p className="truncate text-sm text-foreground-muted">
                  {typeLabel[property.type]} · {listingLabel[property.listingType]} · {formatPrice(property.price, property.priceUnit)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  property.isActive ? "bg-primary/10 text-primary" : "bg-border text-foreground-muted"
                }`}
              >
                {property.isActive ? "Tayang" : "Disembunyikan"}
              </span>
              <Link href={`/pemilik/dashboard/${property.id}`} className="shrink-0 text-sm font-medium text-primary hover:underline">
                Kelola
              </Link>
              <button onClick={() => handleDelete(property.id)} className="shrink-0 text-sm font-medium text-red-600 hover:underline">
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}