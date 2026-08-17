import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · Drivable" },
      { name: "description", content: "Drivable privacy policy. Learn how Bedford Global collects, uses, and protects your information." },
      { property: "og:title", content: "Privacy Policy · Drivable" },
      { property: "og:description", content: "Drivable privacy policy. Learn how Bedford Global collects, uses, and protects your information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy · Drivable" },
      { name: "twitter:description", content: "Drivable privacy policy. Learn how Bedford Global collects, uses, and protects your information." },
    ],
    links: [{ rel: "canonical", href: "https://mydrivable.com/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 text-[#0f172a]">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#1f2b4d]/70">Last updated: August 17, 2026</p>

        <div className="mt-10 space-y-10 text-[15px] leading-7 text-[#1f2b4d]/90">
          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">1. Introduction</h2>
            <p className="mt-3">
              This Privacy Policy explains how Bedford Global ("we", "us", or "our") collects,
              uses, and protects information when you use Drivable (the "Service"). By using the
              Service, you agree to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">2. Information we collect</h2>
            <p className="mt-3">
              We collect information you provide directly to us, such as your email address and any
              profile information you choose to share when you create an account. We also collect
              information about how you use the Service, including study progress, quiz results, and
              feature usage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">3. How we use your information</h2>
            <p className="mt-3">
              We use the information we collect to operate and improve the Service, personalize your
              study experience, communicate with you about your account, and respond to your support
              requests. We may also use usage data to understand how the Service is used and to fix
              bugs or improve features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">4. Payment processing</h2>
            <p className="mt-3">
              Payments for the Pro Pass are processed by Stripe. We do not store full payment card
              details on our servers. Stripe handles payment data in accordance with its own privacy
              policy. We store only the information needed to confirm your purchase and grant access
              to paid features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">5. Analytics and tracking</h2>
            <p className="mt-3">
              We use analytics and tracking tools to understand how visitors interact with the
              Service. These tools may collect data such as your device type, browser, pages visited,
              and general location. You can manage many tracking preferences through your browser or
              device settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">6. Transactional email</h2>
            <p className="mt-3">
              We send transactional emails, including order confirmations, account verification
              messages, and password reset links. You may not opt out of these messages because they
              are necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">7. Information sharing</h2>
            <p className="mt-3">
              We do not sell your personal information. We share information only with service
              providers that help us operate the Service (such as hosting, payment, email, and
              analytics providers), and when required by law or to protect our rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">8. Your choices</h2>
            <p className="mt-3">
              You can update or delete your account information at any time through the Service. If
              you would like to request deletion of your account and associated data, please contact
              us at the email address below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">9. Security</h2>
            <p className="mt-3">
              We take reasonable measures to protect your information from unauthorized access,
              loss, or misuse. However, no method of transmission over the internet or electronic
              storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">10. Children's privacy</h2>
            <p className="mt-3">
              The Service is not directed to children under 13. We do not knowingly collect personal
              information from children under 13. If you believe we have collected information from
              a child under 13, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">11. Changes to this policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. When we make changes, we will
              update the "Last updated" date at the top of this page. Your continued use of the
              Service after any changes means you accept the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f172a]">12. Contact us</h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a
                href="mailto:philip@mydrivable.com"
                className="font-medium text-[#1e40af] hover:underline"
              >
                philip@mydrivable.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
