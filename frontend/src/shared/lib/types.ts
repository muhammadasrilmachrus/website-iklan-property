export type PropertyType = "RUMAH" | "KOST" | "RUKO";
export type ListingType = "JUAL" | "SEWA";
export type PriceUnit = "TOTAL" | "PER_BULAN" | "PER_TAHUN";

export interface Photo {
  id: string;
  url: string;
  order: number;
}

export interface OwnerPublic {
  name: string;
  phone: string | null;
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  priceUnit: PriceUnit;
  description: string;
  address: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;
  isActive: boolean;
  createdAt: string;
  photos: Photo[];
  owner?: OwnerPublic;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}