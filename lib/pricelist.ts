import { readFile } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import type { MockProduct, MockProductDetail, PriceTier } from "@/lib/mock-data";

const DEFAULT_PRICELIST_PATH = path.join(process.cwd(), "data", "ASI_SAGE_PRICELIST.xlsx");

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

/**
 * Load products from the Excel pricelist at data/ASI_SAGE_PRICELIST.xlsx (or PRICELIST_PATH).
 * Supports tiered pricing: T1 QTY, T1 Price, T2 QTY, T2 Price, … T5 QTY, T5 Price.
 * Net Price and New Price 2022 columns are ignored.
 * T1 price is shown on product cards; all tiers are shown in a table on the product detail page.
 */
export async function getProductsFromPricelist(
	filePath: string = process.env.PRICELIST_PATH ?? DEFAULT_PRICELIST_PATH,
): Promise<MockProduct[]> {
	let buffer: Buffer;
	try {
		buffer = await readFile(filePath);
	} catch {
		return [];
	}

	const wb = XLSX.read(buffer, { type: "buffer" });
	const firstSheetName = wb.SheetNames[0];
	if (!firstSheetName) return [];

	const sheet = wb.Sheets[firstSheetName];
	const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

	const products: MockProduct[] = [];
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

/** Build MockProductDetail from a MockProduct (for product detail page). */
function toProductDetail(p: MockProduct): MockProductDetail {
	return {
		id: p.id,
		slug: p.slug,
		name: p.name,
		summary: null,
		images: p.images ?? [],
		...(p.tiers != null && p.tiers.length > 0 && { tiers: p.tiers }),
		variants: (p.variants ?? []).map((v) => ({
			id: v.id,
			price: v.price,
			images: v.images ?? [],
			combinations: [],
		})),
	};
}

/**
 * Load pricelist and return the product matching slug, or null. Use for product/[slug] page.
 */
export async function getProductBySlugFromPricelist(slug: string): Promise<MockProductDetail | null> {
	const products = await getProductsFromPricelist();
	const product = products.find((p) => p.slug === slug) ?? null;
	return product ? toProductDetail(product) : null;
}
