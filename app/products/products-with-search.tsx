"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ProductGridClient } from "@/components/sections/product-grid-client";
import { ProductsSortSelect } from "@/components/products-sort-select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { YnsLink } from "@/components/yns-link";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/product-types";
import type { SortValue } from "@/lib/products-sort";
import {
  getColorsFromProduct,
  getSizesFromProduct,
  productMatchesColor,
  productMatchesSize,
  SWATCH_COLORS,
  getColorDisplayLabel,
} from "@/lib/variant-attributes";

type Collection = { id: string; slug: string; name: string };

type ProductsWithSearchProps = {
  products: Product[];
  collections: Collection[];
  categorySlug: string | null;
  sort: SortValue;
};

function filterBySearch(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.slug && p.slug.toLowerCase().includes(q)) ||
      (p.collectionName && p.collectionName.toLowerCase().includes(q)) ||
      (p.variants?.some((v) => v.sku?.toLowerCase().includes(q)) ?? false),
  );
}

export function ProductsWithSearch({
  products,
  collections,
  categorySlug,
  sort,
}: ProductsWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const { allColors, allSizes } = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    for (const p of products) {
      getColorsFromProduct(p).forEach((c) => {
        if (c in SWATCH_COLORS) colors.add(c);
      });
      getSizesFromProduct(p).forEach((s) => sizes.add(s));
    }
    return {
      allColors: [...colors].sort(),
      allSizes: [...sizes].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = filterBySearch(products, searchQuery);
    if (selectedColors.length > 0) {
      list = list.filter((p) =>
        selectedColors.some((c) => productMatchesColor(p, c)),
      );
    }
    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        selectedSizes.some((s) => productMatchesSize(p, s)),
      );
    }
    return list;
  }, [products, searchQuery, selectedColors, selectedSizes]);

  const hasActiveFilters =
    selectedColors.length > 0 || selectedSizes.length > 0;
  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? [] : [color]));
  };
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const activeCategory = collections.find((c) => c.slug === categorySlug);
  const title = activeCategory ? activeCategory.name : "All products";
  const count = filteredProducts.length;
  const description =
    count === 0
      ? "No products match your search or filters."
      : count === 1
        ? "1 product"
        : `${count} products`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Sidebar filters */}
        <aside
          className={cn(
            "shrink-0 lg:w-56 xl:w-64",
            "rounded-2xl border border-border bg-muted/20 p-4 sm:p-5",
            "lg:sticky lg:top-6 lg:self-start",
          )}
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Filters
          </h2>

          {allColors.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {allColors.map((color) => {
                  const isSelected = selectedColors.includes(color);
                  const hex = SWATCH_COLORS[color] ?? null;
                  const displayLabel = getColorDisplayLabel(color);
                  const swatch = (
                    <button
                      type="button"
                      aria-label={`${displayLabel}${isSelected ? " (selected)" : ""}`}
                      aria-pressed={isSelected}
                      title={displayLabel}
                      onClick={() => toggleColor(color)}
                      className={cn(
                        "shrink-0 rounded-full border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "min-h-[44px] min-w-[44px] h-9 w-9 sm:h-10 sm:w-10",
                        isSelected
                          ? "border-foreground border-[3px] ring-2 ring-foreground ring-offset-2 ring-offset-background shadow-md"
                          : "border-transparent hover:border-muted-foreground/40",
                        !hex && "bg-secondary",
                      )}
                      style={hex ? { backgroundColor: hex } : undefined}
                    />
                  );
                  return (
                    <Tooltip key={color} delayDuration={200}>
                      <TooltipTrigger asChild>{swatch}</TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        {displayLabel}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}

          {allSizes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-2 min-h-[44px] min-w-[44px] text-sm font-medium transition-colors touch-manipulation",
                        isSelected
                          ? "bg-foreground text-background"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-[44px] text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 touch-manipulation"
            >
              Clear filters
            </button>
          )}
        </aside>

        {/* Main: toolbar + search + grid */}
        <div className="min-w-0 flex-1">
          <div className="mb-8 sm:mb-10">
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
                        prefetch="eager"
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
                            prefetch="eager"
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
                  <ProductsSortSelect value={sort} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <label htmlFor="products-search" className="sr-only">
                  Search products
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="products-search"
                    type="search"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          <ProductGridClient
            title={title}
            description={description}
            products={filteredProducts}
            vendorLabel="Your Brand"
            showUnitPriceStyle
            selectedColors={selectedColors}
          />
        </div>
      </div>
    </div>
  );
}
