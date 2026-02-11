import { Suspense } from "react";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { isValidSort, type SortValue } from "@/lib/products-sort";
import { ProductsWithSearch } from "@/app/products/products-with-search";
import {
  getCollectionsFromPricelist,
  getProductsFromPricelist,
} from "@/lib/pricelist";
import type { Product } from "@/lib/product-types";

function getMinPriceMinor(product: Product): number {
  const fromTiers = (product.tiers ?? []).map((t) => Number(t.price));
  const fromVariants = (product.variants ?? []).map((v) => Number(v.price));
  const all = [...fromTiers, ...fromVariants].filter((n) => !Number.isNaN(n));
  return all.length > 0 ? Math.min(...all) : 0;
}

function sortProducts(products: Product[], sort: SortValue): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return sorted.sort((a, b) => getMinPriceMinor(a) - getMinPriceMinor(b));
    case "price-desc":
      return sorted.sort((a, b) => getMinPriceMinor(b) - getMinPriceMinor(a));
    case "name-asc":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

function ProductGridSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
          <div className="mt-2 h-5 w-64 bg-secondary rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={`skeleton-${i}`}>
            <div className="aspect-square bg-secondary rounded-2xl mb-4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-secondary rounded animate-pulse" />
              <div className="h-5 w-1/4 bg-secondary rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const DEFAULT_SORT: SortValue = "name-asc";

async function ProductsContent({
  categorySlug,
  sort,
}: {
  categorySlug: string | null;
  sort: SortValue;
}) {
  const [pricelistProducts, collections] = await Promise.all([
    getProductsFromPricelist(),
    getCollectionsFromPricelist(),
  ]);

  const allProducts = pricelistProducts;

  const filtered =
    categorySlug != null
      ? allProducts.filter((p) => p.collectionSlug === categorySlug)
      : allProducts;

  const products = sortProducts(filtered, sort);

  return (
    <ProductsWithSearch
      products={products}
      collections={collections}
      categorySlug={categorySlug}
      sort={sort}
    />
  );
}

export default async function ProductsPage(props: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort: sortParam } = await props.searchParams;
  const categorySlug = category != null && category !== "" ? category : null;
  const sort: SortValue = isValidSort(sortParam) ? sortParam : DEFAULT_SORT;

  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SiteBreadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Products" }]}
        />
      </div>
      <div className="border-t border-border">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductsContent categorySlug={categorySlug} sort={sort} />
        </Suspense>
      </div>
    </main>
  );
}
