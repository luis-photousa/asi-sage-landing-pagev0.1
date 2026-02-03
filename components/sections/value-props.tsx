import { Package, ShieldCheck, Truck } from "lucide-react";

const props = [
  {
    icon: Package,
    title: "Sublimation-ready blanks",
    description: "Quality blanks designed for vibrant, long-lasting prints.",
  },
  {
    icon: ShieldCheck,
    title: "Wholesale pricing",
    description: "Competitive rates for resellers and volume orders.",
  },
  {
    icon: Truck,
    title: "Reliable shipping",
    description: "Fast turnaround so you can fulfill orders on time.",
  },
] as const;

export function ValueProps() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
          {props.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center sm:items-center sm:text-center"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
                <Icon className="size-6" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-foreground">
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
