"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ContactFormProps = {
  className?: string;
};

export function ContactForm({ className }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5 sm:gap-6", className)}
    >
      <div className="grid gap-2">
        <Label htmlFor="contact-name" className="text-sm font-medium">
          Name
        </Label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          disabled={status === "sending"}
          className="h-11 sm:h-10"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          disabled={status === "sending"}
          className="h-11 sm:h-10"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-message" className="text-sm font-medium">
          Message
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          placeholder="How can we help?"
          rows={5}
          disabled={status === "sending"}
          className="min-h-[140px] sm:min-h-[120px] resize-y"
        />
      </div>
      {status === "sent" && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Thanks! We’ll get back to you soon.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">
          Something went wrong. Please try again or email us directly.
        </p>
      )}
      <Button
        type="submit"
        disabled={status === "sending"}
        className="h-12 px-8 text-base font-medium sm:h-10 sm:px-6 sm:text-sm"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
