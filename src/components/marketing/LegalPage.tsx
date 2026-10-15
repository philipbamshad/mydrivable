import type { ReactNode } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const BUSINESS_NAME = "Bedford Global";
export const SUPPORT_EMAIL = "philip@mydrivable.com";

export function legalHead(path: string, title: string, description: string) {
  const url = `https://www.mydrivable.com${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 text-foreground">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="mt-10 space-y-10 text-[15px] leading-7 text-foreground/90">{children}</div>
      </div>
    </MarketingLayout>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function SupportLink() {
  return (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary underline underline-offset-2">
      {SUPPORT_EMAIL}
    </a>
  );
}
