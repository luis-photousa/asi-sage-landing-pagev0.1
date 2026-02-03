"use client";

import { useState } from "react";
import { Menu, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { YnsLink } from "@/components/yns-link";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="sm:hidden size-9"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(20rem,85vw)] flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <YnsLink
              key={item.href}
              href={item.href}
              prefetch="eager"
              onClick={() => setOpen(false)}
              className={cn(
                "border-b border-border px-6 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted/50 active:bg-muted",
              )}
            >
              {item.label}
            </YnsLink>
          ))}
        </nav>
        <div className="border-t border-border px-6 py-4 sm:hidden">
          <a
            href="tel:000-000-0000"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Phone className="size-4" />
            Call us 000-000-0000
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
