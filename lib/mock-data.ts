/**
 * Fallback data when the pricelist Excel is missing/empty, and the source for
 * navbar/footer collection links and /collection/[slug] pages. Products from
 * data/ASI_SAGE_PRICELIST.xlsx take precedence when available.
 */
export type MockCollection = {
	id: string;
	slug: string;
	name: string;
};

export const mockCollections: MockCollection[] = [
	{ id: "col_featured", slug: "featured", name: "Featured" },
	{ id: "col_new", slug: "new-arrivals", name: "New Arrivals" },
	{ id: "col_best", slug: "best-sellers", name: "Best Sellers" },
	{ id: "col_home", slug: "home", name: "Home" },
	{ id: "col_accessories", slug: "accessories", name: "Accessories" },
];

/** Tiered pricing: min qty to get this unit price (price in minor units, e.g. cents). */
export type PriceTier = {
	tier: string;
	minQty: number;
	price: string;
};

export type MockProduct = {
	id: string;
	slug: string;
	name: string;
	images?: string[];
	tiers?: PriceTier[];
	variants?: {
		id: string;
		price: string;
		images?: string[];
	}[];
};

export const mockProducts: MockProduct[] = [
	{
		id: "prod_001",
		slug: "sage-starter-kit",
		name: "Sage Starter Kit",
		images: ["/screenshot.png", "/logo.svg"],
		variants: [{ id: "var_001", price: "2900", images: ["/screenshot.png"] }],
	},

	{
		id: "prod_002",
		slug: "asi-sage-tee",
		name: "ASI Sage Tee",
		images: [],
		variants: [
			{ id: "var_002_s", price: "2500", images: [] },
			{ id: "var_002_m", price: "3000", images: [] },
		],
	},
	{
		id: "prod_003",
		slug: "minimal-product-no-images",
		name: "Minimal Product (No Images)",
		variants: [{ id: "var_003", price: "1999" }],
	},
	{
		id: "prod_004",
		slug: "minimal-product-no-images",
		name: "Minimal Product (No Images)",
		images: ["https://s3-us-west-1.amazonaws.com/assets.printverse/pro_img/20360/20360-1.5-CeramicShotGlass-White-i.png"],
		variants: [{ id: "var_003", price: "1999" }],
	},
];

type MockVariantValue = {
	id: string;
	value: string;
	colorValue: string | null;
	variantType: {
		id: string;
		type: "string" | "color";
		label: string;
	};
};

export type MockProductDetail = {
	id: string;
	slug: string;
	name: string;
	summary?: string | null;
	images: string[];
	tiers?: PriceTier[];
	variants: {
		id: string;
		price: string;
		images: string[];
		combinations: { variantValue: MockVariantValue }[];
	}[];
};

export const mockProductDetails: MockProductDetail[] = mockProducts.map((p, i) => ({
	id: p.id,
	slug: p.slug,
	name: p.name,
	summary:
		i === 0
			? "Everything you need to get started — curated, simple, and ready to ship."
			: i === 1
				? "A soft everyday tee with a clean, minimal look."
				: "A minimal product used for local development.",
	images: p.images ?? [],
	variants: (p.variants ?? []).map((v) => ({
		id: v.id,
		price: v.price,
		images: v.images ?? [],
		// Empty combinations means: no variant options UI, and URL params are irrelevant.
		combinations: [],
	})),
}));

export type MockCollectionDetail = {
	id: string;
	slug: string;
	name: string;
	description?: string | null;
	image?: string | null;
	productCollections: { product: MockProduct }[];
};

export const mockCollectionDetails: MockCollectionDetail[] = mockCollections.map((c, idx) => ({
	id: c.id,
	slug: c.slug,
	name: c.name,
	description:
		idx === 0
			? "Featured picks for local development."
			: idx === 1
				? "Fresh drops and new arrivals."
				: idx === 2
					? "Popular products people love."
					: idx === 3
						? "Essentials for your space."
						: "The finishing touches.",
	image: "/screenshot.png",
	productCollections: mockProducts.slice(0, 3).map((product) => ({ product })),
}));

export function getMockCollectionBySlug(slug: string) {
	return mockCollectionDetails.find((c) => c.slug === slug) ?? null;
}

export function getMockProductBySlug(slug: string) {
	return mockProductDetails.find((p) => p.slug === slug) ?? null;
}

