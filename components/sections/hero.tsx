import { ArrowRight } from "lucide-react";
import { YnsLink } from "../yns-link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
              Premium wholesale blanks
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              We offer a variety of high-quality products, from blank
              sublimation mugs to drinkware and home goods—designed for
              resellers and businesses.
            </p>
            <div className="mt-10">
              <YnsLink
                prefetch={"eager"}
                href="#products"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-foreground text-primary-foreground rounded-full text-base font-medium hover:bg-foreground/90 transition-colors"
              >
                View products
                <ArrowRight className="h-4 w-4" />
              </YnsLink>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full bg-linear-to-l from-secondary/40 to-transparent pointer-events-none hidden lg:block" />
    </section>
  );
}
