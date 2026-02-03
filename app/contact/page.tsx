import { Mail, Phone } from "lucide-react";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/app/contact/contact-form";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Imprints Photomugs—questions, quotes, or wholesale orders.",
};

export default function ContactPage() {
  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SiteBreadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
        />
      </div>

      <section className="border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto sm:mx-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
              Contact Us
            </h1>
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Have a question, need a quote, or want to place an order? Reach
              out and we’ll get back to you as soon as we can.
            </p>

            {/* Contact info cards — stack on mobile, row on sm+ */}
            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <a
                href="tel:000-000-0000"
                className="flex items-start gap-4 rounded-2xl border border-border bg-background p-6 sm:p-8 transition-colors hover:bg-muted/30 active:bg-muted/50"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
                  <Phone className="size-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Call us
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-foreground">
                    000-000-0000
                  </p>
                </div>
              </a>
              <a
                href="mailto:hello@example.com"
                className="flex items-start gap-4 rounded-2xl border border-border bg-background p-6 sm:p-8 transition-colors hover:bg-muted/30 active:bg-muted/50"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
                  <Mail className="size-6" />
                </div>
                <div className="min-w-0 wrap-break-word">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email us
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-foreground">
                    hello@example.com
                  </p>
                </div>
              </a>
            </div>

            {/* Form section */}
            <div className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-border">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                Send a message
              </h2>
              <p className="mt-2 sm:mt-3 text-muted-foreground leading-relaxed">
                Fill out the form below and we’ll respond within 1–2 business
                days.
              </p>
              <div className="mt-8 sm:mt-10 rounded-2xl border border-border bg-background p-6 sm:p-8 lg:p-10">
                <ContactForm className="gap-5 sm:gap-6" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
