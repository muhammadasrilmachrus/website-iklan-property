import type { PropertyType, ListingType, PriceUnit } from "./types";

export function formatPrice(price: number, unit: PriceUnit) {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
  if (unit === "PER_BULAN") return `${formatted}/bulan`;
  if (unit === "PER_TAHUN") return `${formatted}/tahun`;
  return formatted;
}

export const typeLabel: Record<PropertyType, string> = { RUMAH: "Rumah", KOST: "Kost", RUKO: "Ruko" };
export const listingLabel: Record<ListingType, string> = { JUAL: "Dijual", SEWA: "Disewakan" };

export function waLink(phone: string, title: string) {
  const normalized = phone.startsWith("0") ? `62${phone.slice(1)}` : phone.replace(/\D/g, "");
  const text = encodeURIComponent(`Halo, saya tertarik dengan properti "${title}" yang Anda iklankan di Rumahku.`);
  return `https://wa.me/${normalized}?text=${text}`;
}