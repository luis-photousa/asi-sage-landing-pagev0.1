import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { YnsLink } from "@/components/yns-link";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Imprints Photomugs—premium wholesale blanks for resellers and businesses.",
};

export default function AboutPage() {
  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SiteBreadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        />
      </div>

      <section className="border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto sm:mx-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
              About Us
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Imprints Photomugs supplies premium wholesale blanks for
              resellers, small businesses, and creatives. We focus on
              sublimation-ready drinkware, mugs, and home goods so you can add
              your designs and sell with confidence.
            </p>

            <div className="mt-16 sm:mt-20 space-y-16 sm:space-y-20">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  What we do
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We offer a curated range of high-quality blanks—from
                  accent-colored mugs to travel mugs and specialty
                  items—designed for vibrant, long-lasting sublimation prints.
                  Our products are chosen for durability, print quality, and
                  value, so you can meet your customers’ expectations and grow
                  your business.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  Who we serve
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We work with resellers, print shops, gift shops, and anyone
                  who needs reliable wholesale blanks. Whether you’re ordering
                  in volume or stocking a focused product line, we aim to make
                  sourcing simple and straightforward.
                </p>
              </div>
            </div>

            <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-border">
              <p className="text-muted-foreground leading-relaxed">
                Have questions or want to place an order?{" "}
                <YnsLink
                  prefetch="eager"
                  href="/contact"
                  className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
                >
                  Get in touch
                </YnsLink>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
