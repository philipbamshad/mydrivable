import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection, SupportLink, legalHead } from "@/components/marketing/LegalPage";

export const Route = createFileRoute("/refunds")({
  head: () =>
    legalHead("/refunds", "Refund Policy · Drivable", "Drivable's refund policy for the one-time $9 Pro Pass."),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" updated="October 14, 2026">
      <LegalSection heading="One-time purchase">
        <p>
          The Drivable Pro Pass costs $9, charged once. There is no subscription, so there is nothing to cancel and you
          will never be charged again.
        </p>
      </LegalSection>
      <LegalSection heading="All sales are final">
        <p>
          Because Pro access is delivered instantly, all purchases are final and not refundable, except where a refund is
          required by applicable law. You can try the Free Pass before buying to decide whether Pro is right for you.
        </p>
      </LegalSection>
      <LegalSection heading="Billing problems">
        <p>
          If you were charged twice, charged in error, or did not receive Pro access after paying, email <SupportLink /> with
          your account email and we will fix it.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
