import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ProductSpec = { label: string; value: string };

type ProductSpecificationsProps = {
  specs?: ProductSpec[];
  productId?: string;
  productName?: string;
};

const defaultSpecs: ProductSpec[] = [
  { label: "SKU", value: "—" },
  { label: "Type", value: "Standard" },
  { label: "Material", value: "—" },
  { label: "Dimensions", value: "—" },
  { label: "Weight", value: "—" },
  { label: "Color", value: "—" },
  { label: "Warehouse Location", value: "Northern California" },
];

export function ProductSpecifications({
  specs = defaultSpecs,
}: ProductSpecificationsProps) {
  const rows = specs.length > 0 ? specs : defaultSpecs;

  return (
    <section className="border-t border-border pt-16">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
        Product specifications
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] font-medium text-foreground">
              Specification
            </TableHead>
            <TableHead className="text-muted-foreground">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ label, value }) => (
            <TableRow key={label}>
              <TableCell className="font-medium text-foreground">
                {label}
              </TableCell>
              <TableCell className="text-muted-foreground">{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
