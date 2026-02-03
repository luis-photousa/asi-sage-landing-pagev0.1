"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, type SortValue } from "@/lib/products-sort";

export function ProductsSortSelect({
  value,
  "aria-label": ariaLabel = "Sort products",
}: {
  value: SortValue;
  "aria-label"?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onValueChange(newValue: SortValue) {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue === "name-asc") {
      params.delete("sort");
    } else {
      params.set("sort", newValue);
    }
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={ariaLabel} className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
