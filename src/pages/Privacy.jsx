import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import LegalLayout, { LegalSection } from '../components/LegalLayout';

const Privacy = () => {
  const { email, phone, address } = useSettings();
  const contactEmail = email() || 'info@raslipwani.co.ke';
  const contactPhone = phone() || '+254 758 066 526';
  const officeAddress = address() || 'Nairobi, Kenya';

  return (
    <LegalLayout
      title="Privacy Policy"
      description="How Raslipwani Properties collects, uses, and protects your personal data under the Kenyan Data Protection Act, 2019."
      updatedOn="2026-09-01"
    >
      <p>
        Raslipwani Properties (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is the data controller for the personal
        data described below. This policy explains what we collect when you use this website, why we
        collect it, how long we keep it, and the rights the{' '}
        <strong>Data Protection Act, 2019 (Kenya)</strong> gives you over it.
      </p>

      <LegalSection heading="1. What we collect">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Enquiry and booking details</strong> you submit through our contact and viewing
            forms: your name, email address, phone number, the property or service you are interested
            in, your preferred appointment time, and any notes you choose to add.
          </li>
          <li>
            <strong>Preference details</strong> you optionally provide, such as budget range, preferred
            location, and property type.
          </li>
          <li>
            <strong>Technical and usage data</strong> collected automatically: pages visited, approximate
            region, referring site, device and browser type, and page performance measurements.
          </li>
        </ul>
        <p>
          We do not ask for, and you should not send us, national ID numbers, financial account details,
          or any sensitive personal data through this website.
        </p>
      </LegalSection>

      <LegalSection heading="2. Why we use it, and on what basis">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>To respond to your enquiry and arrange viewings</strong> — necessary to take steps at
            your request before entering into a contract.
          </li>
          <li>
            <strong>To send you a confirmation and follow-up about your specific enquiry</strong> — the
            same basis. These are transactional messages, not marketing.
          </li>
          <li>
            <strong>To operate, secure, and improve the website</strong> — our legitimate interest in
            running a functioning, non-abused service.
          </li>
          <li>
            <strong>To meet legal and regulatory obligations</strong> where these apply to us.
          </li>
        </ul>
        <p>
          <strong>We do not sell your personal data, and we do not share it with third parties for their
          own marketing.</strong> If we ever wish to send you marketing unrelated to your enquiry, we
          will ask for your consent first, and you may withdraw it at any time.
        </p>
      </LegalSection>

      <LegalSection heading="3. Who processes it on our behalf">
        <p>
          We use a small number of service providers, each acting on our instructions under contract:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Supabase</strong> — database and authentication hosting.</li>
          <li><strong>Vercel</strong> — website hosting, plus aggregate analytics and performance measurement.</li>
          <li><strong>Cloudinary</strong> — storage and delivery of property images.</li>
          <li><strong>Resend</strong> — delivery of transactional email relating to your enquiry.</li>
        </ul>
        <p>
          Some of these providers store data on servers outside Kenya. Where personal data is
          transferred abroad, we rely on the provider&rsquo;s contractual data-protection commitments and
          on the safeguards permitted under Part VI of the Data Protection Act, 2019.
        </p>
      </LegalSection>

      <LegalSection heading="4. How long we keep it">
        <p>
          We keep enquiry and booking records for <strong>three years</strong> from your last contact
          with us, so that we can evidence what was agreed and pick up a conversation you resume. After
          that they are deleted or anonymised. Aggregate analytics that cannot identify you may be kept
          longer. You can ask us to erase your records sooner — see section 6.
        </p>
      </LegalSection>

      <LegalSection heading="5. How we protect it">
        <p>
          Access to enquiry data is restricted to authorised staff accounts and enforced at the database
          level, so a visitor to this website cannot read another person&rsquo;s enquiry. Data is
          encrypted in transit. Administrative access requires an individual login.
        </p>
        <p>
          No system is perfectly secure. If a breach occurs that is likely to result in a risk to your
          rights and freedoms, we will notify the Office of the Data Protection Commissioner within 72
          hours of becoming aware of it, and notify you where the law requires it.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your rights">
        <p>Under the Data Protection Act, 2019 you have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>be informed of how your data is used — this policy;</li>
          <li>access a copy of the personal data we hold about you;</li>
          <li>have inaccurate or incomplete data corrected;</li>
          <li>have your data deleted where we no longer have grounds to keep it;</li>
          <li>object to processing based on our legitimate interests;</li>
          <li>request that your data be transferred to you or another controller; and</li>
          <li>withdraw any consent you have given, without affecting prior processing.</li>
        </ul>
        <p>
          To exercise any of these, contact us using the details in section 8. We will respond within the
          statutory timeframe. If you are not satisfied with our response, you may lodge a complaint with
          the <strong>Office of the Data Protection Commissioner (ODPC)</strong>, Kenya.
        </p>
      </LegalSection>

      <LegalSection heading="7. Cookies and similar technologies">
        <p>
          This site uses storage strictly necessary for it to function — for example, keeping an
          administrator signed in. Our analytics provider measures traffic and page performance in
          aggregate and does not build advertising profiles of you. We do not run third-party
          advertising or cross-site tracking cookies.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact us">
        <p>
          Questions, requests, or complaints about this policy or your data:
        </p>
        <ul className="list-none space-y-1">
          <li>
            Email: <a className="text-primary hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </li>
          <li>
            Phone: <a className="text-primary hover:underline" href={`tel:${contactPhone.replace(/\s/g, '')}`}>{contactPhone}</a>
          </li>
          <li>Address: {officeAddress}</li>
        </ul>
      </LegalSection>

      <LegalSection heading="9. Changes to this policy">
        <p>
          We may update this policy as our services or the law change. The revision date at the top of
          this page always reflects the current version. Material changes affecting how we use data you
          have already given us will be notified to you directly where we hold contact details for you.
        </p>
      </LegalSection>

      <p className="text-sm text-gray-500 border-t border-gray-100 pt-6">
        See also our <Link className="text-primary hover:underline" to="/terms">Terms of Service</Link>.
        This policy describes our actual practices; it is not legal advice, and it should be reviewed by
        a qualified Kenyan advocate before being relied upon for regulatory compliance.
      </p>
    </LegalLayout>
  );
};

export default Privacy;
