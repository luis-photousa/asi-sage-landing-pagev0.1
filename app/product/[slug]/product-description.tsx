type ProductDescriptionProps = {
  description?: string | null;
};

const defaultDescription =
  "Quality product designed for reliability and performance. Contact our sales team for full details, customization options, and volume pricing.";

export function ProductDescription({
  description = defaultDescription,
}: ProductDescriptionProps) {
  const content = description?.trim() || defaultDescription;

  return (
    <section className="border-t border-border pt-16">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
        Product description
      </h2>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
        <p className="leading-relaxed">{content}</p>
      </div>
    </section>
  );
}
