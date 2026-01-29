import { cacheLife } from "next/cache";
import { YnsLink } from "@/components/yns-link";
import { mockCollections } from "@/lib/mock-data";

export async function Navbar() {
  "use cache";
  cacheLife("hours");

  if (mockCollections.length === 0) {
    return null;
  }

  return (
    <nav className="hidden sm:flex items-center gap-6">
      <YnsLink
        prefetch={"eager"}
        href="/"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Home
      </YnsLink>
      {mockCollections.map((collection) => (
        <YnsLink
          prefetch={"eager"}
          key={collection.id}
          href={`/collection/${collection.slug}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {collection.name}
        </YnsLink>
      ))}
    </nav>
  );
}
