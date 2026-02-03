import { cacheLife } from "next/cache";
import { YnsLink } from "@/components/yns-link";

export async function Navbar() {
  "use cache";
  cacheLife("hours");

  return (
    <nav className="hidden sm:flex items-center gap-6">
      <YnsLink
        prefetch={"eager"}
        href="/"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Home
      </YnsLink>
      <YnsLink
        prefetch={"eager"}
        href="/products"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Products
      </YnsLink>
      <YnsLink
        prefetch={"eager"}
        href="/about"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        About
      </YnsLink>
      <YnsLink
        prefetch={"eager"}
        href="/contact"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Contact
      </YnsLink>
    </nav>
  );
}
