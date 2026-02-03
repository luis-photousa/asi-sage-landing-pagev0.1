/** Tiered pricing: min qty to get this unit price (price in minor units, e.g. cents). */
export type PriceTier = {
	tier: string;
	minQty: number;
	price: string;
};

export type Product = {
	id: string;
	slug: string;
	name: string;
	images?: string[];
	tiers?: PriceTier[];
	collectionSlug?: string;
	collectionName?: string;
	variants?: {
		id: string;
		price: string;
		images?: string[];
		label?: string;
		sku?: string;
	}[];
};

export type ProductVariantValue = {
	id: string;
	value: string;
	colorValue: string | null;
	variantType: { id: string; type: "string" | "color"; label: string };
};

export type ProductDetail = {
	id: string;
	slug: string;
	name: string;
	summary?: string | null;
	images: string[];
	tiers?: PriceTier[];
	collectionSlug?: string;
	collectionName?: string;
	variants: {
		id: string;
		price: string;
		images: string[];
		combinations: { variantValue: ProductVariantValue }[];
		sku?: string;
	}[];
};
