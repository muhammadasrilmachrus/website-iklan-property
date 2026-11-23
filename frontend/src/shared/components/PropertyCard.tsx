import Link from "next/link";
import type { Property } from "../lib/types";
import { formatPrice, typeLabel, listingLabel } from "../lib/format";

export default function PropertyCard({ property }: { property: Property }) {
  const photo = property.photos[0];

  return (
    <Link
      href={`/properti/${property.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-border">
        {photo ? (
          <img
            src={`/api${photo.url}`}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-foreground-muted">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
            </svg>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground shadow">
          {typeLabel[property.type]}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-primary-foreground ${
            property.listingType === "JUAL" ? "bg-accent" : "bg-primary"
          }`}
        >
          {listingLabel[property.listingType]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="truncate font-serif text-lg text-foreground">{property.title}</h3>
        <p className="mt-1 truncate text-sm text-foreground-muted">{property.city}</p>
        <p className="mt-3 text-lg font-semibold text-primary">{formatPrice(property.price, property.priceUnit)}</p>
        {(property.bedrooms || property.bathrooms || property.areaM2) && (
          <div className="mt-3 flex gap-4 text-xs text-foreground-muted">
            {property.bedrooms ? <span>{property.bedrooms} KT</span> : null}
            {property.bathrooms ? <span>{property.bathrooms} KM</span> : null}
            {property.areaM2 ? <span>{property.areaM2} m²</span> : null}
          </div>
        )}
      </div>
    </Link>
  );
}