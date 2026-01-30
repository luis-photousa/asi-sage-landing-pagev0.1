import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { YnsLink } from "@/components/yns-link";

export type BreadcrumbItemType = {
  label: string;
  href?: string;
};

type SiteBreadcrumbsProps = {
  items: BreadcrumbItemType[];
  className?: string;
};

export function SiteBreadcrumbs({ items, className }: SiteBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, i) => (
          <span key={i} className="contents">
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href != null ? (
                <BreadcrumbLink asChild>
                  <YnsLink prefetch={"eager"} href={item.href}>
                    {item.label}
                  </YnsLink>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
