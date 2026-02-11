import type { Product } from "@/lib/product-types";

const PRODUCT_SUFFIXES = [
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

/**
 * Extract color from a variant label (e.g. "11 oz. two-tone black mug" → "black").
 * Returns normalized lowercase string for filtering, or null if none.
 */
export function getColorFromVariantLabel(label: string): string | null {
	const v = label.trim();
	if (!v) return null;
	const lower = v.toLowerCase();
	let before = v;
	for (const suf of PRODUCT_SUFFIXES) {
		if (lower.endsWith(suf)) {
			before = v.slice(0, v.length - suf.length).trim();
			break;
		}
	}
	const parts = before.split(/\s+/).filter(Boolean);
	if (parts.length === 0) return null;
	const twoWord = /\b(light|dark|cambridge)\s+\w+$/i.exec(before);
	if (twoWord) {
		const a = twoWord[1];
		const b = parts[parts.length - 1];
		if (!a || !b) return null;
		return `${a.toLowerCase()} ${b.toLowerCase()}`;
	}
	const last = parts[parts.length - 1];
	return last ? last.toLowerCase() : null;
}

/** Unique normalized colors (lowercase) from a product's variant labels. */
export function getColorsFromProduct(product: Product): string[] {
	const colors = new Set<string>();
	for (const v of product.variants ?? []) {
		const label = v.label ?? "";
		const color = getColorFromVariantLabel(label);
		if (color) colors.add(color);
	}
	return [...colors];
}

/** Normalize size string for comparison: "11 oz.", "15 oz" → "11 oz", "15 oz". */
function normalizeSize(s: string): string {
	return s.replace(/\s*\.\s*$/, "").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Extract size tokens from text (e.g. "11 oz. two-tone mug" → ["11 oz"]). */
const SIZE_PATTERN = /\d+\s*oz\.?/gi;

function getSizesFromText(text: string): string[] {
	const out = new Set<string>();
	let m: RegExpExecArray | null;
	const re = new RegExp(SIZE_PATTERN.source, "gi");
	while ((m = re.exec(text)) !== null) {
		out.add(normalizeSize(m[0]));
	}
	return [...out];
}

/** Unique sizes from product name and all variant labels. */
export function getSizesFromProduct(product: Product): string[] {
	const sizes = new Set<string>();
	getSizesFromText(product.name).forEach((s) => sizes.add(s));
	for (const v of product.variants ?? []) {
		const label = v.label ?? "";
		getSizesFromText(label).forEach((s) => sizes.add(s));
	}
	return [...sizes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export function productMatchesColor(product: Product, colorNormalized: string): boolean {
	const productColors = getColorsFromProduct(product);
	return productColors.some((c) => c === colorNormalized);
}

export function productMatchesSize(product: Product, sizeNormalized: string): boolean {
	const productSizes = getSizesFromProduct(product);
	return productSizes.some((s) => s === sizeNormalized);
}

/** Hex values for color swatches (sidebar and product page). Keys lowercase. */
export const SWATCH_COLORS: Record<string, string> = {
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
	white: "#f5f5f5",
};

/** Display label for a normalized color key (e.g. "light blue" → "Light blue"). */
export function getColorDisplayLabel(normalizedColor: string): string {
	const lower = normalizedColor.trim().toLowerCase();
	const twoWord = /^(light|dark|cambridge)\s+(\w+)$/.exec(lower);
	if (twoWord) {
		const a = twoWord[1];
		const b = twoWord[2];
		return `${a.charAt(0).toUpperCase()}${a.slice(1)} ${b.charAt(0).toUpperCase()}${b.slice(1)}`;
	}
	return lower ? lower.replace(/^./, (c) => c.toUpperCase()) : normalizedColor;
}
