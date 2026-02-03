import { Suspense } from "react";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { ProductsSortSelect } from "@/components/products-sort-select";
import { isValidSort, type SortValue } from "@/lib/products-sort";
import { ProductGrid } from "@/components/sections/product-grid";
import {
  getCollectionsFromPricelist,
  getProductsFromPricelist,
} from "@/lib/pricelist";
import type { Product } from "@/lib/product-types";
import { YnsLink } from "@/components/yns-link";
import { cn } from "@/lib/utils";

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
  const count = products.length;
  const activeCategory = collections.find((c) => c.slug === categorySlug);

  return (
    <>
      {/* Toolbar: category filter + sort — contained, modern */}
      <div className="max-w-7xl mx-auto px-4 mt-3 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            {collections.length > 0 && (
              <div className="min-w-0 flex-1">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </p>
                <div
                  className={cn(
                    "flex gap-2 sm:gap-2.5",
                    "overflow-x-auto pb-1 -mx-0.5 px-0.5 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap",
                    "[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1",
                  )}
                >
                  <YnsLink
                    prefetch={"eager"}
                    href="/products"
                    className={cn(
                      "shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                      categorySlug == null
                        ? "bg-foreground text-background shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    All
                  </YnsLink>
                  {collections.map((collection) => {
                    const isActive = categorySlug === collection.slug;
                    return (
                      <YnsLink
                        prefetch={"eager"}
                        key={collection.id}
                        href={`/products?category=${encodeURIComponent(collection.slug)}`}
                        className={cn(
                          "shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-foreground text-background shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {collection.name}
                      </YnsLink>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sort
              </p>
              <Suspense
                fallback={
                  <div className="h-9 w-[180px] rounded-lg border border-input bg-muted/30 animate-pulse" />
                }
              >
                <ProductsSortSelect value={sort} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <ProductGrid
        title={activeCategory ? activeCategory.name : "All products"}
        description={count === 1 ? "1 product" : `${count} products`}
        products={products}
        limit={count}
        showViewAll={false}
        vendorLabel="Your Brand"
        showUnitPriceStyle
      />
    </>
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
