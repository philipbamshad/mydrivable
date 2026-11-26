import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection, SupportLink, legalHead } from "@/components/marketing/LegalPage";
import { Button } from "@/components/ui/button";
import { openCookiePreferences } from "@/components/CookieConsent";

export const Route = createFileRoute("/cookies")({
  head: () =>
    legalHead("/cookies", "Cookie Policy · Drivable", "Which cookies and browser storage Drivable uses and how to control them."),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="November 25, 2026">
      <LegalSection heading="Essential cookies">
        <p>
          These keep you signed in, remember your study progress and theme, and let our payment provider (Stripe) process
          checkout securely. The Service cannot work without them, so they are always on.
        </p>
      </LegalSection>
      <LegalSection heading="Analytics cookies">
        <p>We do not currently use analytics cookies. If we add them, they will only run after you opt in.</p>
      </LegalSection>
      <LegalSection heading="Marketing cookies">
        <p>Only after you accept Marketing cookies, Meta Pixel loads for advertising measurement and reports page visits, demo page views, account sign-ups and confirmed Pro Pass purchases. No emails, names or other personal details are sent. Meta may use cookies such as _fbp and _fbc to measure advertising. Rejecting or withdrawing Marketing permission stops future pixel events; your browser’s Global Privacy Control signal also blocks them. We do not enable automatic form-data collection.</p>
      </LegalSection>
      <LegalSection heading="Your choices">
        <p>You can change your choice at any time.</p>
        <Button variant="outline" onClick={openCookiePreferences}>Cookie preferences</Button>
      </LegalSection>
      <LegalSection heading="Contact">
        <p>Questions? Email <SupportLink />.</p>
      </LegalSection>
    </LegalPage>
  );
}
