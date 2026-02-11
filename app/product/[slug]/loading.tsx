import { Loader2 } from "lucide-react";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6 sm:py-8">
        <SiteBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "…", href: "#" },
          ]}
        />
      </div>
      <div className="border-t border-border pt-8 lg:pt-10 lg:grid lg:grid-cols-2 lg:gap-16">
        {/* Left: prominent spinner so it's always visible */}
        <div className="flex flex-col items-center justify-center min-h-[320px] lg:min-h-[480px] rounded-2xl bg-muted/50 border-2 border-dashed border-border">
          <Loader2
            className="size-16 text-foreground animate-spin shrink-0"
            aria-hidden
          />
          <p className="mt-5 text-base font-medium text-foreground">
            Loading product…
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Please wait</p>
        </div>

        {/* Right: details skeleton */}
        <div className="mt-8 lg:mt-0 space-y-8">
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-secondary rounded animate-pulse" />
            <div className="h-8 w-1/4 bg-secondary rounded animate-pulse" />
            <div className="h-5 w-1/3 bg-secondary rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="size-10 rounded-full bg-secondary animate-pulse"
                />
              ))}
            </div>
            <div className="h-12 w-48 bg-secondary rounded-lg animate-pulse" />
          </div>
          <div className="h-32 w-full bg-secondary rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
