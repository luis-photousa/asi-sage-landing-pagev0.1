import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { FooterYear } from "@/components/footer-year";
import { YnsLink } from "@/components/yns-link";
import { getCollectionsFromPricelist } from "@/lib/pricelist";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

async function FooterCategories() {
  "use cache";
  cacheLife("hours");

  const collections = await getCollectionsFromPricelist();
  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {collections.map((collection) => (
        <YnsLink
          key={collection.id}
          prefetch="eager"
          href={`/products?category=${encodeURIComponent(collection.slug)}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
        >
          {collection.name}
        </YnsLink>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer: centered stack */}
        <div className="py-12 sm:py-16 flex flex-col items-center text-center">
          {/* Brand */}
          <YnsLink
            prefetch={"eager"}
            href="/"
            className="text-xl font-bold text-foreground hover:opacity-90 transition-opacity"
          >
            Imprints Photomugs
          </YnsLink>
          <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
            Curated essentials for modern living. Quality products, thoughtfully
            designed.
          </p>

          {/* Quick links */}
          <nav
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
            aria-label="Footer navigation"
          >
            {quickLinks.map((link) => (
              <YnsLink
                key={link.href}
                prefetch={"eager"}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </YnsLink>
            ))}
          </nav>

          {/* Categories */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Categories
            </p>
            <Suspense fallback={<div className="h-6" />}>
              <FooterCategories />
            </Suspense>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            &copy; <FooterYear /> Your Next Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
