import { Suspense } from "react";
import { ProductGrid } from "@/components/sections/product-grid";
import { getProductsFromPricelist } from "@/lib/pricelist";
import { mockProducts } from "@/lib/mock-data";

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
        {Array.from({ length: 6 }).map((_, i) => (
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

export default async function ProductsPage() {
  const pricelist = await getProductsFromPricelist();
  const products = pricelist.length > 0 ? pricelist : mockProducts;

  return (
    <main>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid
          title="All Products"
          description="Browse our full catalog"
          products={products}
          limit={products.length}
          showViewAll={false}
        />
      </Suspense>
    </main>
  );
}
