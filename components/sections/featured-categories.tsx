import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { YnsLink } from "../yns-link";

type CategoryBlock = {
  title: string;
  subtitle?: string;
  href: string;
  image?: string;
};

const defaultCategories: CategoryBlock[] = [
  {
    title: "Accent colored mugs",
    subtitle: "Sublimation blanks",
    href: "/collection/featured",
  },
  {
    title: "Travel mugs",
    subtitle: "Sublimation blanks",
    href: "/collection/new-arrivals",
  },
  {
    title: "Magic mugs",
    subtitle: "Color changing",
    href: "/collection/best-sellers",
  },
];

type FeaturedCategoriesProps = {
  categories?: CategoryBlock[];
};

export function FeaturedCategories({
  categories = defaultCategories,
}: FeaturedCategoriesProps) {
  return (
    <section className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((category) => (
            <YnsLink
              key={category.href}
              prefetch={"eager"}
              href={category.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-4/3 bg-secondary">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-muted/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  {category.subtitle && (
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {category.subtitle}
                    </p>
                  )}
                  <h2 className="mt-1 text-lg font-semibold text-foreground">
                    {category.title}
                  </h2>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                  Shop {category.title.toLowerCase()}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </YnsLink>
          ))}
        </div>
      </div>
    </section>
  );
}
