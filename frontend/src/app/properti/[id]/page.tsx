"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../shared/lib/api";
import type { Property } from "../../../shared/lib/types";
import { formatPrice, typeLabel, listingLabel, waLink } from "../../../shared/lib/format";

type LoadState = "loading" | "ok" | "fail";

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    apiFetch<Property>(`/properties/${params.id}`)
      .then((data) => {
        setProperty(data);
        setState("ok");
      })
      .catch(() => setState("fail"));
  }, [params.id]);

  if (state === "loading") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-96 animate-pulse rounded-2xl bg-border" />
      </main>
    );
  }

  if (state === "fail" || !property) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-foreground-muted">Properti tidak ditemukan atau sudah tidak tersedia.</p>
      </main>
    );
  }

  const photos = property.photos;
  const mainPhoto = photos[activePhoto];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-border">
            {mainPhoto ? (
              <img src={`/api${mainPhoto.url}`} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-foreground-muted">Belum ada foto</div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setActivePhoto(index)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    index === activePhoto ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={`/api${photo.url}`} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-background px-3 py-1 font-medium text-foreground">
              {typeLabel[property.type]}
            </span>
            <span
              className={`rounded-full px-3 py-1 font-medium text-primary-foreground ${
                property.listingType === "JUAL" ? "bg-accent" : "bg-primary"
              }`}
            >
              {listingLabel[property.listingType]}
            </span>
          </div>
          <h1 className="mt-3 font-serif text-2xl text-foreground">{property.title}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {property.address}, {property.city}
          </p>
          <p className="mt-4 text-2xl font-semibold text-primary">{formatPrice(property.price, property.priceUnit)}</p>

          {(property.bedrooms || property.bathrooms || property.areaM2) && (
            <div className="mt-4 flex gap-4 border-y border-border py-3 text-sm text-foreground-muted">
              {property.bedrooms ? <span>{property.bedrooms} Kamar Tidur</span> : null}
              {property.bathrooms ? <span>{property.bathrooms} Kamar Mandi</span> : null}
              {property.areaM2 ? <span>{property.areaM2} m²</span> : null}
            </div>
          )}

          <p className="mt-4 whitespace-pre-line text-sm text-foreground">{property.description}</p>

          {property.owner?.phone ? (
            <a
              href={waLink(property.owner.phone, property.title)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center justify-center rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90"
            >
              Hubungi via WhatsApp
            </a>
          ) : (
            <p className="mt-5 text-sm text-foreground-muted">Pemilik: {property.owner?.name}</p>
          )}
        </aside>
      </div>
    </main>
  );
}