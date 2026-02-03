export const SORT_OPTIONS = [
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const SORT_VALUES: SortValue[] = SORT_OPTIONS.map((o) => o.value);

export function isValidSort(s: string | undefined): s is SortValue {
  return typeof s === "string" && SORT_VALUES.includes(s as SortValue);
}
