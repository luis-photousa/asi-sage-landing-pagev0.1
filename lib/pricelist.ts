import { readFile } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import type { PriceTier, Product, ProductDetail } from "@/lib/product-types";

const DEFAULT_PRICELIST_PATH = path.join(process.cwd(), "data", "ASI_SAGE_PRICELIST.xlsx");
const ENRICHED_PRICELIST_PATH = path.join(process.cwd(), "data", "ASI_SAGE_PRICELIST_enriched.xlsx");

function normalizeHeader(h: string): string {
	return String(h)
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");
}

const NAME_KEYS = [
	"productname",
	"product_name",
	"name",
	"product",
	"item",
	"description",
	"itemname",
	"item_name",
	"title",
];
const PRICE_KEYS = [
	"price",
	"unitprice",
	"unit_price",
	"retail",
	"msrp",
	"listprice",
	"list_price",
	"cost",
];
const SKU_KEYS = ["sku", "id", "item", "itemid", "item_id", "productid", "product_id"];
const IMAGE_KEYS = ["image", "imageurl", "image_url", "photo", "picture", "img", "image_link"];

/** T1 QTY, T1 Price, T2 QTY, T2 Price, ... (Net Price and New Price 2022 are ignored). */
const TIER_NUMBERS = [1, 2, 3, 4, 5] as const;

function getTiersFromRow(row: Record<string, unknown>): PriceTier[] {
	const normalizedRow: Record<string, string> = {};
	for (const [k, v] of Object.entries(row)) {
		const n = normalizeHeader(k);
		if (n && v != null && v !== "") normalizedRow[n] = String(v).trim();
	}
	const tiers: PriceTier[] = [];
	for (const n of TIER_NUMBERS) {
		const qtyVal = normalizedRow[`t${n}qty`] ?? normalizedRow[`t${n}_qty`];
		const priceVal = normalizedRow[`t${n}price`] ?? normalizedRow[`t${n}_price`];
		const priceMinor = parsePriceToMinorUnits(priceVal);
		const minQty = qtyVal != null ? Number.parseInt(String(qtyVal).replace(/\D/g, ""), 10) : NaN;
		if (priceMinor != null && !Number.isNaN(minQty) && minQty > 0) {
			tiers.push({ tier: `T${n}`, minQty, price: priceMinor });
		}
	}
	return tiers;
}

function pickCell(row: Record<string, unknown>, keys: string[]): string | null {
	const normalizedRow: Record<string, string> = {};
	for (const [k, v] of Object.entries(row)) {
		const n = normalizeHeader(k);
		if (n && v != null && v !== "") normalizedRow[n] = String(v).trim();
	}
	for (const key of keys) {
		const v = normalizedRow[key];
		if (v) return v;
	}
	return null;
}

/** Parse price from "$19.99", "19.99", or number → minor units string (e.g. "1999"). */
function parsePriceToMinorUnits(value: string | number | null | undefined): string | null {
	if (value == null || value === "") return null;
	const s = String(value).replace(/[$,\s]/g, "");
	const num = Number.parseFloat(s);
	if (Number.isNaN(num) || num < 0) return null;
	const cents = Math.round(num * 100);
	return String(cents);
}

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "") || "product";
}

function getStr(row: Record<string, unknown>, key: string): string {
	const v = row[key];
	return v != null && v !== "" ? String(v).trim() : "";
}

const ENRICHED_IMAGE_KEYS = Array.from(
	{ length: 20 },
	(_, i) => `Image ${i + 1}`,
);

/** Detect enriched format: has "Product" and "Category" columns. */
function isEnrichedFormat(rows: Record<string, unknown>[]): boolean {
	const first = rows[0];
	if (!first) return false;
	return "Product" in first && "Category" in first;
}

const PRODUCT_SUFFIXES = [" mug", " mugs", " glass", " glasses", " stein", " tile", " tiles", " sleeve", " pad", " pads", " box", " ornament", " mirror", " notebook", " enamel"];

/**
 * Derive a product group key from variant name by stripping the color/variant word(s).
 * E.g. "11 oz. rim/handle red mug" -> "11 oz. rim/handle mug"; "11 oz. two-tone light blue mug" -> "11 oz. two-tone mug".
 */
function deriveProductKeyFromName(name: string): string {
	const v = name.trim();
	if (!v) return v;
	const lower = v.toLowerCase();
	for (const suf of PRODUCT_SUFFIXES) {
		if (!lower.endsWith(suf)) continue;
		const before = v.slice(0, v.length - suf.length).trim();
		const parts = before.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return v;
		const twoWordColor = /\b(light|dark|cambridge)\s+\w+$/i.exec(before);
		const toStrip = twoWordColor ? 2 : 1;
		const stripped = parts.slice(0, -toStrip).join(" ");
		return `${stripped}${suf}`.trim();
	}
	return v;
}

/** Title-case product key for display: "11 oz. rim/handle mug" -> "11 oz. Rim/Handle Mug". */
function productKeyToDisplayName(key: string): string {
	return key
		.split(/\s+/)
		.map((word, i) => {
			if (/^\d+\.?$/.test(word) || word === "oz") return word;
			if (word.includes("/")) {
				return word.split("/").map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("/");
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join(" ");
}

/** Parse enriched sheet: group by Product (or derived key from Name), merge all images, one product per group with variants. */
function parseEnrichedRows(rows: Record<string, unknown>[]): Product[] {
	const byProduct = new Map<string, Record<string, unknown>[]>();
	for (const row of rows) {
		const name = getStr(row, "Name");
		const productColumn = getStr(row, "Product");
		const productName =
			productColumn && productColumn !== name
				? productColumn
				: name
					? (deriveProductKeyFromName(name) || name)
					: getStr(row, "SKU");
		if (!productName) continue;
		const tiers = getTiersFromRow(row);
		const t1Price = tiers.length > 0 ? tiers[0].price : parsePriceToMinorUnits(pickCell(row, PRICE_KEYS));
		if (!t1Price) continue;
		const list = byProduct.get(productName) ?? [];
		list.push(row);
		byProduct.set(productName, list);
	}

	const products: Product[] = [];
	const seenSlugs = new Set<string>();

	for (const [productKey, groupRows] of byProduct) {
		const firstRow = groupRows[0]!;
		const productColumn = getStr(firstRow, "Product");
		const firstRowName = getStr(firstRow, "Name");
		const displayName =
			productColumn && productColumn !== firstRowName
				? productColumn
				: productKeyToDisplayName(productKey);

		let slug = slugify(productKey);
		if (seenSlugs.has(slug)) slug = `${slug}-${getStr(firstRow, "SKU")}`;
		seenSlugs.add(slug);

		const id = `prod_${slug.replace(/-/g, "_")}`;
		const tiers = getTiersFromRow(firstRow);
		const category = getStr(firstRow, "Category");
		const collectionSlug = category
			? category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || undefined
			: undefined;

		const allImages: string[] = [];
		for (const row of groupRows) {
			for (const key of ENRICHED_IMAGE_KEYS) {
				const url = getStr(row, key);
				if (url && !allImages.includes(url)) allImages.push(url);
			}
		}

		const variants = groupRows.map((row, i) => {
			const rowTiers = getTiersFromRow(row);
			const price = rowTiers.length > 0 ? rowTiers[0].price : parsePriceToMinorUnits(pickCell(row, PRICE_KEYS)) ?? "0";
			const variantImages: string[] = [];
			for (const key of ENRICHED_IMAGE_KEYS) {
				const url = getStr(row, key);
				if (url) variantImages.push(url);
			}
			const label = getStr(row, "Name") || getStr(row, "SKU") || undefined;
			const sku = getStr(row, "SKU") || undefined;
			return {
				id: `var_${id}_${i}`,
				price,
				images: variantImages.length > 0 ? variantImages : undefined,
				...(label && { label }),
				...(sku && { sku }),
			};
		});

		products.push({
			id,
			slug,
			name: displayName,
			images: allImages.length > 0 ? allImages : undefined,
			...(tiers.length > 0 && { tiers }),
			...(collectionSlug && category && { collectionSlug, collectionName: category }),
			variants,
		});
	}

	return products;
}

/**
 * Load products from the Excel pricelist.
 * Prefers data/ASI_SAGE_PRICELIST_enriched.xlsx when present (grouped by Product, all images, categories).
 * Falls back to ASI_SAGE_PRICELIST.xlsx or PRICELIST_PATH (one row per product).
 */
export async function getProductsFromPricelist(
	filePath?: string,
): Promise<Product[]> {
	const pathToUse = filePath ?? process.env.PRICELIST_PATH;
	let buffer: Buffer;

	if (!pathToUse) {
		try {
			buffer = await readFile(ENRICHED_PRICELIST_PATH);
		} catch {
			try {
				buffer = await readFile(DEFAULT_PRICELIST_PATH);
			} catch {
				return [];
			}
		}
	} else {
		try {
			buffer = await readFile(pathToUse);
		} catch {
			return [];
		}
	}

	const wb = XLSX.read(buffer, { type: "buffer" });
	const firstSheetName = wb.SheetNames[0];
	if (!firstSheetName) return [];

	const sheet = wb.Sheets[firstSheetName];
	const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

	if (isEnrichedFormat(rows)) {
		return parseEnrichedRows(rows);
	}

	const products: Product[] = [];
	const seenSlugs = new Set<string>();

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		const name = pickCell(row, NAME_KEYS);
		if (!name) continue;

		const tiers = getTiersFromRow(row);
		const t1Price = tiers.length > 0 ? tiers[0].price : parsePriceToMinorUnits(pickCell(row, PRICE_KEYS));
		if (!t1Price) continue;

		const sku = pickCell(row, SKU_KEYS) ?? `row_${i + 2}`;
		const imageUrl = pickCell(row, IMAGE_KEYS);
		let slug = slugify(name);
		if (seenSlugs.has(slug)) slug = `${slug}-${i}`;
		seenSlugs.add(slug);

		const id = `prod_${slug.replace(/-/g, "_")}`;
		const variantId = `var_${id}`;

		products.push({
			id,
			slug,
			name,
			images: imageUrl ? [imageUrl] : [],
			...(tiers.length > 0 && { tiers }),
			variants: [
				{
					id: variantId,
					price: t1Price,
					images: imageUrl ? [imageUrl] : [],
				},
			],
		});
	}

	return products;
}

/** Build combinations for product detail from variant label (enriched pricelist). */
function buildCombinations(v: { label?: string }): { variantValue: { id: string; value: string; colorValue: string | null; variantType: { id: string; type: "string" | "color"; label: string } } }[] {
	if (!v.label) return [];
	const id = `val_${v.label.replace(/\s+/g, "_").toLowerCase().replace(/[^a-z0-9_]/g, "")}`;
	return [
		{
			variantValue: {
				id: id || "val_option",
				value: v.label,
				colorValue: null,
				variantType: { id: "opt_variant", type: "string", label: "Variant" },
			},
		},
	];
}

/** Build ProductDetail from a Product (for product detail page). */
function toProductDetail(p: Product): ProductDetail {
	return {
		id: p.id,
		slug: p.slug,
		name: p.name,
		summary: null,
		images: p.images ?? [],
		...(p.tiers != null && p.tiers.length > 0 && { tiers: p.tiers }),
		...(p.collectionSlug && p.collectionName && { collectionSlug: p.collectionSlug, collectionName: p.collectionName }),
		variants: (p.variants ?? []).map((v) => ({
			id: v.id,
			price: v.price,
			images: v.images ?? [],
			combinations: buildCombinations(v),
			...(v.sku != null && { sku: v.sku }),
		})),
	};
}

/**
 * Load pricelist and return the product matching slug, or null. Use for product/[slug] page.
 */
export async function getProductBySlugFromPricelist(slug: string): Promise<ProductDetail | null> {
	const products = await getProductsFromPricelist();
	const product = products.find((p) => p.slug === slug) ?? null;
	return product ? toProductDetail(product) : null;
}

export type PricelistCollection = { id: string; slug: string; name: string };

/**
 * Return unique categories from the pricelist (from Category column in enriched sheet).
 * Use for nav and collection pages when pricelist has categories.
 */
export async function getCollectionsFromPricelist(): Promise<PricelistCollection[]> {
	const products = await getProductsFromPricelist();
	const bySlug = new Map<string, string>();
	for (const p of products) {
		const slug = p.collectionSlug;
		const name = p.collectionName;
		if (!slug || !name || bySlug.has(slug)) continue;
		bySlug.set(slug, name);
	}
	return Array.from(bySlug.entries(), ([slug, name]) => ({
		id: `col_${slug}`,
		slug,
		name,
	}));
}

export type PricelistCollectionDetail = {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	image: string | null;
	productCollections: { product: Product }[];
};

/**
 * Return collection detail for a slug when the pricelist has that category; else null.
 */
export async function getCollectionBySlugFromPricelist(slug: string): Promise<PricelistCollectionDetail | null> {
	const [products, collections] = await Promise.all([
		getProductsFromPricelist(),
		getCollectionsFromPricelist(),
	]);
	const col = collections.find((c) => c.slug === slug);
	if (!col) return null;
	const productsInCollection = products.filter((p) => p.collectionSlug === slug);
	return {
		id: col.id,
		slug: col.slug,
		name: col.name,
		description: null,
		image: null,
		productCollections: productsInCollection.map((product) => ({ product })),
	};
}
