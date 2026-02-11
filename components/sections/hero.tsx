import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { YnsLink } from "../yns-link";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden aspect-4/3 min-h-[50vh] sm:aspect-2/1 sm:min-h-[45vh] lg:aspect-21/9 lg:min-h-[55vh]">
      {/* Background image — proportional frame prevents skew on any screen */}
      <Image
        src="/hero-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      />
      {/* Overlay for text readability */}
      <div
        className="absolute inset-0 bg-background/70 pointer-events-none"
        aria-hidden
      />
      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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
    </section>
  );
}
