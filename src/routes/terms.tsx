import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection, SupportLink, legalHead, BUSINESS_NAME } from "@/components/marketing/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () =>
    legalHead("/terms", "Terms of Service · Drivable", "The terms that govern your use of Drivable, operated by Bedford Global."),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 14, 2026">
      <LegalSection heading="1. Agreement">
        <p>
          These Terms govern your use of Drivable (the "Service"), operated by {BUSINESS_NAME} ("we", "us"). By creating an
          account or using the Service, you agree to these Terms and our <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.
        </p>
      </LegalSection>
      <LegalSection heading="2. Eligibility">
        <p>
          You must be at least 13 years old to use the Service. If you are under 18, you confirm that a parent or legal
          guardian has reviewed and agreed to these Terms on your behalf.
        </p>
      </LegalSection>
      <LegalSection heading="3. Your account">
        <p>
          You are responsible for keeping your login details secure and for all activity on your account. Provide accurate
          information and do not share your account or create accounts for others without permission.
        </p>
      </LegalSection>
      <LegalSection heading="4. Acceptable use">
        <p>
          Do not misuse the Service: no attempts to bypass usage limits or payments, scrape or resell content, disrupt the
          platform, or use the AI coach for unlawful purposes.
        </p>
      </LegalSection>
      <LegalSection heading="5. Study content and AI">
        <p>
          Drivable is an independent study aid and is not affiliated with or endorsed by any state DMV. Practice questions
          and AI answers may contain mistakes. Always confirm rules with your official state driver handbook. We do not
          guarantee that you will pass any exam.
        </p>
      </LegalSection>
      <LegalSection heading="6. Purchases">
        <p>
          The Drivable Pro Pass is a one-time $9 purchase that unlocks unlimited access for the life of the Service. The
          price shown at checkout is the full amount; there are no subscriptions or recurring charges. All sales are final,
          as described in our <Link to="/refunds" className="text-primary underline">Refund Policy</Link>.
        </p>
      </LegalSection>
      <LegalSection heading="7. Termination">
        <p>
          You may stop using the Service and request deletion of your account at any time. We may suspend accounts that
          violate these Terms.
        </p>
      </LegalSection>
      <LegalSection heading="8. Disclaimers and limitation of liability">
        <p>
          The Service is provided "as is" without warranties of any kind. To the fullest extent permitted by law,{" "}
          {BUSINESS_NAME} is not liable for indirect or consequential damages, and our total liability is limited to the
          amount you paid us in the 12 months before the claim.
        </p>
      </LegalSection>
      <LegalSection heading="9. Disputes">
        <p>
          Please contact us first so we can try to resolve any issue informally. These Terms are governed by the laws of
          the State of California, and disputes will be handled in the courts located there, unless the law where you live
          requires otherwise.
        </p>
      </LegalSection>
      <LegalSection heading="10. Changes">
        <p>We may update these Terms. Continued use after an update means you accept the new Terms.</p>
      </LegalSection>
      <LegalSection heading="11. Contact">
        <p>Questions? Email <SupportLink />.</p>
      </LegalSection>
    </LegalPage>
  );
}
