import { DeviceBrand, DeviceSeries, DeviceModel } from "@/lib/types";

export const deviceBrands: DeviceBrand[] = [
  { id: "db1", name: "Samsung", slug: "samsung" },
  { id: "db2", name: "Apple", slug: "apple" },
  { id: "db3", name: "Huawei", slug: "huawei" },
  { id: "db4", name: "Xiaomi", slug: "xiaomi" },
];

export const deviceSeries: DeviceSeries[] = [
  { id: "ds1", brandId: "db1", name: "Galaxy S22 Series", slug: "galaxy-s22-series" },
  { id: "ds2", brandId: "db1", name: "Galaxy S24 Series", slug: "galaxy-s24-series" },
  { id: "ds3", brandId: "db1", name: "Galaxy A Series", slug: "galaxy-a-series" },
  { id: "ds4", brandId: "db2", name: "iPhone 15 Series", slug: "iphone-15-series" },
  { id: "ds5", brandId: "db2", name: "iPhone 13 Series", slug: "iphone-13-series" },
];

// Flat list of every model that can be tagged as compatible — this is what
// drives the ProductForm's compatible-devices picker. In production this
// comes from the `device_models` table (supabase/migrations/003_search_architecture.sql).
export const deviceModels: DeviceModel[] = [
  { id: "dm1", seriesId: "ds1", brandId: "db1", name: "Galaxy S22", slug: "galaxy-s22" },
  { id: "dm2", seriesId: "ds1", brandId: "db1", name: "Galaxy S22+", slug: "galaxy-s22-plus" },
  { id: "dm3", seriesId: "ds1", brandId: "db1", name: "Galaxy S22 Ultra", slug: "galaxy-s22-ultra" },
  { id: "dm4", seriesId: "ds2", brandId: "db1", name: "Galaxy S24", slug: "galaxy-s24" },
  { id: "dm5", seriesId: "ds2", brandId: "db1", name: "Galaxy S24+", slug: "galaxy-s24-plus" },
  { id: "dm6", seriesId: "ds2", brandId: "db1", name: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra" },
  { id: "dm7", seriesId: "ds3", brandId: "db1", name: "Galaxy A14", slug: "galaxy-a14" },
  { id: "dm8", seriesId: "ds3", brandId: "db1", name: "Galaxy A24", slug: "galaxy-a24" },
  { id: "dm9", seriesId: "ds3", brandId: "db1", name: "Galaxy A34", slug: "galaxy-a34" },
  { id: "dm10", seriesId: "ds4", brandId: "db2", name: "iPhone 15", slug: "iphone-15" },
  { id: "dm11", seriesId: "ds4", brandId: "db2", name: "iPhone 15 Plus", slug: "iphone-15-plus" },
  { id: "dm12", seriesId: "ds4", brandId: "db2", name: "iPhone 15 Pro", slug: "iphone-15-pro" },
  { id: "dm13", seriesId: "ds4", brandId: "db2", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max" },
  { id: "dm14", seriesId: "ds5", brandId: "db2", name: "iPhone 13", slug: "iphone-13" },
  { id: "dm15", seriesId: "ds5", brandId: "db2", name: "iPhone 13 mini", slug: "iphone-13-mini" },
];

export function modelsForBrand(brandId: string) {
  return deviceModels.filter((m) => m.brandId === brandId);
}
