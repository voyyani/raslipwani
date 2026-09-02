import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import LegalLayout, { LegalSection } from '../components/LegalLayout';

const Terms = () => {
  const { email, phone } = useSettings();
  const contactEmail = email() || 'info@raslipwani.co.ke';
  const contactPhone = phone() || '+254 758 066 526';

  return (
    <LegalLayout
      title="Terms of Service"
      description="The terms governing your use of the Raslipwani Properties website and the property services offered through it."
      updatedOn="2026-09-01"
    >
      <p>
        These terms govern your use of the Raslipwani Properties website and any enquiry, viewing, or
        consultation you request through it. By using this site you accept them. If you do not accept
        them, please do not use the site.
      </p>

      <LegalSection heading="1. What we do">
        <p>
          We market residential and commercial property in Kenya, arrange viewings, and provide
          valuation, acquisition, and property-management services. We act as an intermediary between
          buyers, tenants, sellers, and landlords. Unless we have signed a separate written agreement
          with you, we are not your legal representative, your financial adviser, or a party to any
          transaction you enter into with a property owner.
        </p>
      </LegalSection>

      <LegalSection heading="2. Property listings are indicative">
        <p>
          Listing details — prices, dimensions, availability, photographs, amenities, and location
          descriptions — are supplied by property owners and their agents and are provided in good
          faith for guidance only. They are not offers capable of acceptance, and they do not form part
          of any contract.
        </p>
        <p>
          <strong>Verify before you commit.</strong> Before paying any money or signing anything, satisfy
          yourself independently as to title, boundaries, condition, approvals, rates, and the identity
          and authority of the seller or landlord. We recommend engaging an advocate and a qualified
          surveyor or valuer. Photographs may be edited, and prices may change without notice.
        </p>
      </LegalSection>

      <LegalSection heading="3. Bookings and viewings">
        <ul className="list-disc pl-6 space-y-2">
          <li>Submitting a form is a <strong>request</strong>. An appointment exists only once we confirm it to you.</li>
          <li>Give accurate contact details — we cannot confirm an appointment we cannot reach you about.</li>
          <li>Please give reasonable notice if you need to cancel or reschedule, so the slot can be reused.</li>
          <li>Viewings depend on owner and agent availability and may be rescheduled for reasons outside our control.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Payments and fraud warning">
        <p>
          Any fees for our services will be agreed with you in writing in advance. We will never ask you
          to send money to a personal mobile-money number or a bank account communicated only by email
          or social media.
        </p>
        <p className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900">
          <strong>If you receive payment instructions claiming to be from us, telephone us on a number
          you obtained independently and confirm them before sending anything.</strong> We are not liable
          for money sent to accounts we did not confirm to you by voice.
        </p>
      </LegalSection>

      <LegalSection heading="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>submit false, misleading, or third-party contact details;</li>
          <li>scrape, harvest, or bulk-copy listings, images, or contact data;</li>
          <li>attempt to gain unauthorised access to any part of the site, its accounts, or its database;</li>
          <li>interfere with the site&rsquo;s operation or security, or probe it without our written permission; or</li>
          <li>use the site for any unlawful purpose or to send unsolicited commercial messages.</li>
        </ul>
        <p>We may suspend access where we reasonably believe these terms are being breached.</p>
      </LegalSection>

      <LegalSection heading="6. Intellectual property">
        <p>
          The site&rsquo;s design, text, branding, and layout belong to us or our licensors. Property
          photographs remain the property of their respective owners and are used with permission. You
          may view and print pages for your own non-commercial use. Any other reproduction, republication,
          or commercial use requires our prior written consent.
        </p>
      </LegalSection>

      <LegalSection heading="7. Availability">
        <p>
          We aim to keep the site available and accurate but do not guarantee uninterrupted or error-free
          operation. We may change, suspend, or withdraw any part of it, including individual listings, at
          any time and without notice.
        </p>
      </LegalSection>

      <LegalSection heading="8. Liability">
        <p>
          Nothing in these terms excludes or limits liability that cannot lawfully be excluded, including
          liability for death or personal injury caused by our negligence, or for fraud or fraudulent
          misrepresentation.
        </p>
        <p>
          Subject to that, we are not liable for indirect or consequential loss, loss of profit, or loss
          of opportunity arising from your use of the site or from reliance on listing information that a
          third party supplied to us. Our total liability in connection with any service we provide is
          limited to the fees you have paid us for that service.
        </p>
      </LegalSection>

      <LegalSection heading="9. Links to other sites">
        <p>
          The site links to services operated by others, including our construction affiliate. We do not
          control those sites and are not responsible for their content, practices, or terms.
        </p>
      </LegalSection>

      <LegalSection heading="10. Privacy">
        <p>
          Our handling of personal data is described in our{' '}
          <Link className="text-primary hover:underline" to="/privacy">Privacy Policy</Link>, which forms
          part of these terms.
        </p>
      </LegalSection>

      <LegalSection heading="11. Governing law">
        <p>
          These terms are governed by the laws of Kenya, and the courts of Kenya have exclusive
          jurisdiction over any dispute arising from them. We ask that you contact us first — most
          disputes are resolved faster by a conversation than by a filing.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes and contact">
        <p>
          We may revise these terms; the revision date at the top of this page reflects the current
          version, and continued use of the site after a change constitutes acceptance of it.
        </p>
        <ul className="list-none space-y-1">
          <li>
            Email: <a className="text-primary hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </li>
          <li>
            Phone: <a className="text-primary hover:underline" href={`tel:${contactPhone.replace(/\s/g, '')}`}>{contactPhone}</a>
          </li>
        </ul>
      </LegalSection>

      <p className="text-sm text-gray-500 border-t border-gray-100 pt-6">
        These terms describe how we operate; they are not legal advice, and they should be reviewed by a
        qualified Kenyan advocate before being relied upon.
      </p>
    </LegalLayout>
  );
};

export default Terms;
