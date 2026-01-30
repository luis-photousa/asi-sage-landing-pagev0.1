import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImprintTemplatesProps = {
  imprintTemplateUrl?: string | null;
  blankImageUrl?: string | null;
  productName?: string;
};

export function ImprintTemplates({
  imprintTemplateUrl,
  blankImageUrl,
}: ImprintTemplatesProps) {
  const hasImprint = Boolean(imprintTemplateUrl?.trim());
  const hasBlank = Boolean(blankImageUrl?.trim());
  if (!hasImprint && !hasBlank) {
    return (
      <section className="border-t border-border pt-16">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
          Templates
        </h2>
        <p className="text-muted-foreground">
          Imprint and blank templates available on request. Contact our sales
          team for download links.
        </p>
      </section>
    );
  }

  return (
    <section className="border-t border-border pt-16">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
        Templates
      </h2>
      <div className="flex flex-wrap gap-4">
        {hasImprint && (
          <Button asChild variant="outline" size="lg">
            <a
              href={imprintTemplateUrl!}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Download className="size-4" />
              Imprint template
            </a>
          </Button>
        )}
        {hasBlank && (
          <Button asChild variant="outline" size="lg">
            <a
              href={blankImageUrl!}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Download className="size-4" />
              Blank image
            </a>
          </Button>
        )}
      </div>
    </section>
  );
}
