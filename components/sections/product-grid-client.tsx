"use client";

import Image from "next/image";
import { Package } from "lucide-react";
import { CURRENCY, LOCALE } from "@/lib/constants";
import type { Product } from "@/lib/product-types";
import { formatMoney } from "@/lib/money";
import { getColorFromVariantLabel } from "@/lib/variant-attributes";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { YnsLink } from "@/components/yns-link";

type ProductGridClientProps = {
  title: string;
  description: string;
  products: Product[];
  vendorLabel?: string;
  showUnitPriceStyle?: boolean;
  /** When set, card images prefer the variant that matches this color (e.g. show red mug when filtering by red). */
  selectedColors?: string[];
};

export function ProductGridClient({
  title,
  description,
  products,
  vendorLabel,
  showUnitPriceStyle = false,
  selectedColors = [],
}: ProductGridClientProps) {
  if (products.length === 0) {
    return (
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
      >
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-medium text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        <Empty className="border border-border rounded-2xl py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No matching products</EmptyTitle>
            <EmptyDescription>
              Try a different search or browse all categories.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    );
  }

  return (
    <section
      id="products"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-medium text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {products.map((product, index) => {
          const variants = product.variants ?? null;
          const firstVariantPrice = variants?.[0]
            ? BigInt(variants[0].price)
            : null;
          const { minPrice, maxPrice } =
            variants && firstVariantPrice !== null
              ? variants.reduce(
                  (acc, v) => {
                    const price = BigInt(v.price);
                    return {
                      minPrice: price < acc.minPrice ? price : acc.minPrice,
                      maxPrice: price > acc.maxPrice ? price : acc.maxPrice,
                    };
                  },
                  { minPrice: firstVariantPrice, maxPrice: firstVariantPrice },
                )
              : { minPrice: null, maxPrice: null };

          const priceDisplay =
            variants &&
            variants.length > 1 &&
            minPrice &&
            maxPrice &&
            minPrice !== maxPrice
              ? `${formatMoney({ amount: minPrice, currency: CURRENCY, locale: LOCALE })} - ${formatMoney({ amount: maxPrice, currency: CURRENCY, locale: LOCALE })}`
              : minPrice
                ? formatMoney({
                    amount: minPrice,
                    currency: CURRENCY,
                    locale: LOCALE,
                  })
                : null;

          const allImages = [
            ...(product.images ?? []),
            ...(variants
              ?.flatMap((v) => v.images ?? [])
              .filter((img) => !(product.images ?? []).includes(img)) ?? []),
          ];

          const matchingVariant =
            selectedColors.length > 0 &&
            variants?.find((v) => {
              const c = getColorFromVariantLabel(v.label ?? "");
              return c != null && selectedColors.includes(c);
            });

          const primaryImage =
            matchingVariant?.images?.[0] ?? product.images?.[0] ?? allImages[0];
          const secondaryCandidate =
            matchingVariant?.images?.[1] ?? product.images?.[1] ?? allImages[1];
          const secondaryImage =
            secondaryCandidate && secondaryCandidate !== primaryImage
              ? secondaryCandidate
              : allImages.find((img) => img !== primaryImage);

          return (
            <YnsLink
              prefetch={false}
              key={product.id}
              href={`/product/${product.slug}`}
              className="group"
            >
              <div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden mb-4">
                {primaryImage && (
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 6}
                    loading={index < 6 ? undefined : "lazy"}
                    className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                )}
                {secondaryImage && (
                  <Image
                    src={secondaryImage}
                    alt={`${product.name} - alternate view`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                )}
              </div>
              <div className="space-y-2">
                {vendorLabel && (
                  <p className="text-xs text-muted-foreground">
                    Vendor: {vendorLabel}
                  </p>
                )}
                <h3 className="text-base font-medium text-foreground leading-snug">
                  {product.name}
                </h3>
                {showUnitPriceStyle && priceDisplay ? (
                  <div className="space-y-0.5 text-sm">
                    <p className="font-semibold text-foreground">
                      {priceDisplay}
                      <span className="ml-1 font-normal text-muted-foreground">
                        /unit cost
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-base font-semibold text-foreground">
                    {priceDisplay}
                  </p>
                )}
              </div>
            </YnsLink>
          );
        })}
      </div>
    </section>
  );
}
