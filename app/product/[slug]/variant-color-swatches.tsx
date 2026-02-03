"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

/** Hex values for swatch backgrounds by color name (lowercase). */
const SWATCH_COLORS: Record<string, string> = {
  maroon: "#782f40",
  red: "#ba0c2f",
  pink: "#e4a9bb",
  orange: "#dc4405",
  yellow: "#d9c756",
  "light green": "#a4d65e",
  green: "#00594c",
  "light blue": "#02a3e0",
  "cambridge blue": "#307fe2",
  blue: "#250e62",
  black: "#101820",
};

function getHexForDisplayLabel(displayLabel: string): string | null {
  const key = displayLabel.toLowerCase().trim();
  return SWATCH_COLORS[key] ?? null;
}

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

/**
 * Derive a short display label from variant value (e.g. "11 oz. two-tone blue mug" → "Blue").
 * Strips common product suffixes (mug, glass, etc.), then takes last 1–2 words for color (e.g. "Cambridge Blue").
 */
function getDisplayLabel(value: string): string {
  const v = value.trim();
  if (!v) return "";
  const lower = v.toLowerCase();
  const suffixes = [
    " mug",
    " mugs",
    " glass",
    " glasses",
    " stein",
    " tile",
    " tiles",
    " sleeve",
    " pad",
    " pads",
    " box",
    " ornament",
    " mirror",
    " notebook",
    " enamel",
  ];
  let before = v;
  for (const suf of suffixes) {
    if (lower.endsWith(suf)) {
      before = v.slice(0, v.length - suf.length).trim();
      break;
    }
  }
  const parts = before.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return v.slice(0, 12);
  const twoWord = /\b(light|dark|cambridge)\s+\w+$/i.exec(before);
  if (twoWord) {
    const a = twoWord[1];
    const b = parts[parts.length - 1];
    return `${a.charAt(0).toUpperCase()}${a.slice(1).toLowerCase()} ${b.charAt(0).toUpperCase()}${b.slice(1).toLowerCase()}`;
  }
  const last = parts[parts.length - 1];
  return last ? last.replace(/^./, (c) => c.toUpperCase()) : v.slice(0, 12);
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
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      {variantIdsWithColor.map(({ variant, color }) => {
        const isSelected = variant.id === selectedId;
        const displayLabel = getDisplayLabel(color.value);
        const hexFromData = color.colorValue?.trim();
        const hexFromDataValid =
          hexFromData?.startsWith("#") &&
          /^#[0-9A-Fa-f]{3,8}$/.test(hexFromData);
        const hexFromMap = getHexForDisplayLabel(displayLabel);
        const hex = hexFromDataValid ? hexFromData : hexFromMap;
        const hasHex = hex != null;

        const swatch = (
          <button
            key={variant.id}
            type="button"
            aria-label={`${displayLabel}${isSelected ? " (selected)" : ""}`}
            aria-pressed={isSelected}
            title={displayLabel}
            onClick={() => setVariant(variant.id)}
            className={cn(
              "shrink-0 rounded-full border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "h-9 w-9 sm:h-10 sm:w-10",
              isSelected
                ? "border-foreground"
                : "border-transparent hover:border-muted-foreground/40",
              !hasHex && "bg-secondary",
            )}
            style={hasHex ? { backgroundColor: hex } : undefined}
          />
        );

        return (
          <Tooltip key={variant.id} delayDuration={200}>
            <TooltipTrigger asChild>{swatch}</TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {displayLabel}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
