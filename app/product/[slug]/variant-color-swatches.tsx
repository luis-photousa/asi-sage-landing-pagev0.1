"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

type VariantValue = {
  value: string;
  colorValue: string | null;
  variantType: { label: string };
};

type Variant = {
  id: string;
  combinations: { variantValue: VariantValue }[];
};

type VariantColorSwatchesProps = {
  variants: Variant[];
  optionLabel?: string;
};

/** Get the first Color (or optionLabel) combination from a variant for swatch display. */
function getColorOption(
  variant: Variant,
  optionLabel: string = "Color",
): { value: string; colorValue: string | null } | null {
  const combo = variant.combinations.find(
    (c) =>
      c.variantValue.variantType.label.toLowerCase() ===
      optionLabel.toLowerCase(),
  );
  if (!combo) return null;
  return {
    value: combo.variantValue.value,
    colorValue: combo.variantValue.colorValue ?? null,
  };
}

export function VariantColorSwatches({
  variants,
  optionLabel = "Color",
}: VariantColorSwatchesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const variantIdsWithColor = variants
    .map((v) => ({ variant: v, color: getColorOption(v, optionLabel) }))
    .filter(
      (
        x,
      ): x is {
        variant: Variant;
        color: { value: string; colorValue: string | null };
      } => x.color != null,
    );

  if (variantIdsWithColor.length === 0) return null;

  const currentVariantId = searchParams.get("variant") ?? null;
  const selectedId =
    currentVariantId && variants.some((v) => v.id === currentVariantId)
      ? currentVariantId
      : (variants[0]?.id ?? null);

  const setVariant = useCallback(
    (variantId: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("variant", variantId);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{optionLabel}</p>
      <div className="flex flex-wrap items-center gap-2">
        {variantIdsWithColor.map(({ variant, color }) => {
          const isSelected = variant.id === selectedId;
          const hex = color.colorValue?.trim();
          const isHex = hex?.startsWith("#") && /^#[0-9A-Fa-f]{3,8}$/.test(hex);

          return (
            <button
              key={variant.id}
              type="button"
              aria-label={`${color.value}${isSelected ? " (selected)" : ""}`}
              aria-pressed={isSelected}
              onClick={() => setVariant(variant.id)}
              className={cn(
                "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "border-border hover:border-muted-foreground",
                !isHex &&
                  "bg-secondary text-muted-foreground text-xs font-medium",
              )}
              style={isHex ? { backgroundColor: hex } : undefined}
            >
              {!isHex && color.value.slice(0, 1).toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
