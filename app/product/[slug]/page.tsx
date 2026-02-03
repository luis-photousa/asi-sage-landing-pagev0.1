import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ImageGallery } from "@/app/product/[slug]/image-gallery";
import { ImprintTemplates } from "@/app/product/[slug]/imprint-templates";
import { VariantColorSwatches } from "@/app/product/[slug]/variant-color-swatches";
import { ProductFeatures } from "@/app/product/[slug]/product-features";
import { ProductDescription } from "@/app/product/[slug]/product-description";
import { ProductSpecifications } from "@/app/product/[slug]/product-specifications";
import { ProductShippingReturns } from "@/app/product/[slug]/product-shipping-returns";
import { WhoWeAre } from "@/app/product/[slug]/who-we-are";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { getProductBySlugFromPricelist } from "@/lib/pricelist";
import { CURRENCY, LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { slug } = await props.params;
  const { variant: variantId } = await props.searchParams;
  return (
    <ProductDetailsContent slug={slug} variantId={variantId ?? undefined} />
  );
}

const ProductDetailsContent = async ({
  slug,
  variantId,
}: {
  slug: string;
  variantId?: string;
}) => {
  "use cache";
  cacheLife("minutes");

  const product = await getProductBySlugFromPricelist(slug);

  if (!product) {
    notFound();
  }

  const selectedVariant =
    variantId != null
      ? (product.variants.find((v) => v.id === variantId) ??
        product.variants[0])
      : product.variants[0];

  const displayPrice = selectedVariant
    ? BigInt(selectedVariant.price)
    : product.variants[0]
      ? BigInt(product.variants[0].price)
      : BigInt(0);

  const { minPrice, maxPrice } = product.variants.reduce(
    (acc, v) => {
      const price = BigInt(v.price);
      return {
        minPrice: price < acc.minPrice ? price : acc.minPrice,
        maxPrice: price > acc.maxPrice ? price : acc.maxPrice,
      };
    },
    {
      minPrice: product.variants[0]
        ? BigInt(product.variants[0].price)
        : BigInt(0),
      maxPrice: product.variants[0]
        ? BigInt(product.variants[0].price)
        : BigInt(0),
    },
  );

  const priceDisplay =
    product.variants.length > 1 && minPrice !== maxPrice
      ? `${formatMoney({ amount: minPrice, currency: CURRENCY, locale: LOCALE })} - ${formatMoney({ amount: maxPrice, currency: CURRENCY, locale: LOCALE })}`
      : formatMoney({
          amount: displayPrice,
          currency: CURRENCY,
          locale: LOCALE,
        });

  const allImages = [
    ...product.images,
    ...product.variants
      .flatMap((v) => v.images)
      .filter((img) => !product.images.includes(img)),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6 sm:py-8">
        <SiteBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            ...(product.collectionName && product.collectionSlug
              ? [
                  {
                    label: product.collectionName,
                    href: `/collection/${product.collectionSlug}`,
                  },
                  { label: product.name },
                ]
              : [
                  { label: "Products", href: "/products" },
                  { label: product.name },
                ]),
          ]}
        />
      </div>
      <div className="border-t border-border pt-8 lg:pt-10 lg:grid lg:grid-cols-2 lg:gap-16">
        {/* Left: Image Gallery (sticky on desktop) */}
        <ImageGallery
          images={allImages}
          productName={product.name}
          variants={product.variants}
        />

        {/* Right: Product Details */}
        <div className="mt-8 lg:mt-0 space-y-8">
          {/* Title, Price, Description */}
          <div className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tight text-foreground lg:text-5xl text-balance">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold tracking-tight">
              {priceDisplay}
            </p>
            {selectedVariant?.sku && (
              <p className="text-sm text-muted-foreground">
                SKU: {selectedVariant.sku}
              </p>
            )}
            <p className="text-sm text-muted-foreground">In stock</p>
            <VariantColorSwatches
              variants={product.variants}
              optionLabel="Variant"
            />
            <Button asChild size="lg" className="mt-4">
              <a
                href={`mailto:sales@example.com?subject=Inquiry: ${encodeURIComponent(product.name)}`}
              >
                <MessageCircle className="size-4" />
                Contact sales rep
              </a>
            </Button>

            {/* Volume pricing table */}
            {product.tiers != null && product.tiers.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Volume pricing
                </h2>
                <p className="text-sm text-muted-foreground">
                  Minimum order quantity per tier to get the unit price below.
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-right">Min. qty</TableHead>
                      <TableHead className="text-right">Unit price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.tiers.map((tier) => (
                      <TableRow key={tier.tier}>
                        <TableCell className="font-medium">
                          {tier.tier}
                        </TableCell>
                        <TableCell className="text-right">
                          {tier.minQty.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatMoney({
                            amount: BigInt(tier.price),
                            currency: CURRENCY,
                            locale: LOCALE,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product description */}
      <ProductDescription description={product.summary} />

      {/* Product specifications */}
      <ProductSpecifications
        specs={[
          { label: "SKU", value: product.id },
          { label: "Type", value: "Standard" },
          { label: "Material", value: "—" },
          { label: "Dimensions", value: "—" },
          { label: "Weight", value: "—" },
          {
            label: "Color",
            value:
              [
                ...new Set(
                  product.variants.flatMap((v) =>
                    v.combinations
                      .filter(
                        (c) =>
                          c.variantValue.variantType.label.toLowerCase() ===
                          "color",
                      )
                      .map((c) => c.variantValue.value),
                  ),
                ),
              ].join(", ") || "—",
          },
        ]}
      />

      {/* Product shipping & returns */}
      <ProductShippingReturns />

      {/* Imprint / blank templates */}
      <ImprintTemplates />

      {/* Who we are */}
      <WhoWeAre />

      {/* Features (crafted with intention) */}
      <ProductFeatures />
    </div>
  );
};
