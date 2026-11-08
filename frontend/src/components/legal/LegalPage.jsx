// LegalPage — Privacy Policy and Terms of Use on one shared editorial shell.
// `kind` ('privacy' | 'terms') switches the content; the layout is never duplicated.
// Facts follow AGENTS.md + the product brief; unknown facts are marked as
// <Ph> placeholders the team must fill before launch.
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './legal.css';
import Logo from '../Logo.jsx';

const LAST_UPDATED = 'October 23, 2026';

/* Marked placeholder for facts the team still has to confirm. */
function Ph({ children }) {
  return (
    <mark className="legal-ph" title="Placeholder — replace with the real value before launch">
      {children}
    </mark>
  );
}

const PRIV_EMAIL = <Ph>privacy@quadly.in</Ph>;

/* ------------------------------------------------------------------ */
/* Privacy Policy — 13 sections                                        */
/* ------------------------------------------------------------------ */

const PRIVACY_SECTIONS = [
  {
    id: 'privacy-scope',
    title: 'Controller & scope',
    body: (
      <>
        <p>
          This Privacy Policy explains how <strong>Quadly</strong> <Ph>[legal entity name to be
          confirmed]</Ph> — the controller (a “Data Fiduciary” under India’s Digital Personal Data
          Protection Act, 2023) — handles personal data when you use the Quadly website and web app:
          browsing the site, creating an account, completing onboarding, applying to the campus
          ambassador program, and any related support contact.
        </p>
        <p>
          Quadly is currently in <strong>closed beta</strong>. Some statements below describe what
          exists in the beta today versus what applies at launch; we flag the difference where it
          matters. Questions at any time: {PRIV_EMAIL}.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-collect',
    title: 'What we collect',
    body: (
      <>
        <p>We collect only what each feature needs. Per feature:</p>
        <div className="legal-tablewrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th style={{ width: '26%' }}>Feature</th>
                <th>Data we handle</th>
                <th style={{ width: '30%' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Accounts</strong></td>
                <td>
                  Your email address and your password — the password is never stored in plain
                  text; it is handled as a secure hash by our authentication system.
                </td>
                <td>
                  During the closed beta, accounts live in an isolated in-memory staging store. At
                  launch, accounts are stored on our Supabase (PostgreSQL) database and passwords
                  are hashed by the Supabase authentication system.
                </td>
              </tr>
              <tr>
                <td><strong>Onboarding profile</strong></td>
                <td>
                  First name, college, the campus-ambassador link (if you followed one), your
                  target company and role, and your GitHub username.
                </td>
                <td>
                  Used to tailor your plan and to show whether a campus ambassador is already
                  active at your college.
                </td>
              </tr>
              <tr>
                <td><strong>Ambassador applications</strong></td>
                <td>
                  Name, email, college, year of study, portfolio handle, estimated reach, your
                  motivation text, and a record of the consent itself (see Section 4).
                </td>
                <td>
                  Submitted voluntarily. If selected, stipend payments are handled under a separate
                  signed agreement, which will describe any additional details needed to pay you.
                </td>
              </tr>
              <tr>
                <td><strong>Technical logs</strong></td>
                <td>
                  Basic technical logs generated when you use the site — such as request
                  timestamps and error diagnostics — used only to keep the service secure and
                  reliable.
                </td>
                <td>Short-lived; see Section 7 for retention.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          We do not use advertising or cross-site tracking scripts, and we set no tracking cookies
          (see Section 6).
        </p>
      </>
    ),
  },
  {
    id: 'privacy-purposes',
    title: 'Why we process it — purposes & lawful bases',
    body: (
      <>
        <p>
          Under the EU General Data Protection Regulation (GDPR) every use of your data needs a
          “lawful basis”; under the DPDP Act, 2023 we process data with your consent or under the
          “legitimate uses” recognised by Section 7 of that Act. For each purpose:
        </p>
        <div className="legal-tablewrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Purpose</th>
                <th>Lawful basis (GDPR)</th>
                <th>Basis (DPDP Act, 2023)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Creating your account</strong> and keeping it working</td>
                <td>Performance of a contract — Art. 6(1)(b)</td>
                <td>Section 7 legitimate uses: data you voluntarily provide for a purpose you can reasonably expect</td>
              </tr>
              <tr>
                <td><strong>Building your onboarding profile</strong> and tailoring your daily plan</td>
                <td>Performance of a contract — Art. 6(1)(b)</td>
                <td>Section 7 legitimate uses (voluntary provision)</td>
              </tr>
              <tr>
                <td><strong>Evaluating ambassador applications</strong>, including the college match described in Section 4</td>
                <td>Consent — Art. 6(1)(a)</td>
                <td>Consent, given with the application and withdrawable at any time</td>
              </tr>
              <tr>
                <td><strong>Security, abuse prevention</strong> and the integrity of beta staging</td>
                <td>Legitimate interests — Art. 6(1)(f): keeping Quadly and its users safe</td>
                <td>Section 7 legitimate uses: security and prevention of unlawful acts</td>
              </tr>
              <tr>
                <td><strong>Honouring your rights requests</strong> (deletion, access, correction) and, where required, complying with law</td>
                <td>Legal obligation — Art. 6(1)(c)</td>
                <td>Compliance with law / Section 7 legitimate uses</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Where we rely on consent, you can withdraw it at any time by emailing {PRIV_EMAIL} —
          withdrawal does not affect processing that already happened before your withdrawal.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-ambassadors',
    title: 'Ambassadors',
    body: (
      <>
        <p>
          The campus ambassador program is optional. When you apply you voluntarily give us{' '}
          <strong>name, email, college, year of study, portfolio handle, estimated reach</strong>{' '}
          and your <strong>motivation text</strong>.
        </p>
        <p>
          We record your consent together with your application. On the application page this takes
          the form of a required checkbox with exactly this text:
        </p>
        <blockquote className="legal-quote">
          “I have read the Privacy Policy and consent to Quadly processing my application data to
          evaluate this application.”
        </blockquote>
        <p>
          Your application is evaluated only to assess you for the program. To show whether a campus
          ambassador is already active at your college, a college name may be checked against our
          ambassador roster with the help of an external large-language-model (LLM) provider —{' '}
          <strong>only the college name is sent</strong>, never your motivation text, contact
          details or any other personal content.
        </p>
        <p>
          Applications are kept for <strong>up to 12 months</strong> so we can consider you for
          current and future cohorts (see Section 7). Applying is not a commitment to select you,
          and selection is communicated separately: <strong>stipends and tiers apply only after a
          separate signed agreement</strong>, which will also govern any additional data needed to
          pay you.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-storage',
    title: 'Storage, processors & transfers',
    body: (
      <>
        <p>We run Quadly on a small, named set of providers — no advertising networks, no data brokers:</p>
        <div className="legal-tablewrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Processor</th>
                <th>Role</th>
                <th style={{ width: '34%' }}>What reaches them</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Supabase</strong></td>
                <td>Database and authentication hosting (our production store, live at launch)</td>
                <td>Accounts, onboarding profiles and applications; passwords only as secure hashes</td>
              </tr>
              <tr>
                <td><strong>LLM provider</strong> <Ph>an Indian-region LLM provider (announced at launch)</Ph></td>
                <td>Ambassador matching: checking a college name against the ambassador roster</td>
                <td>Only the college name — nothing else</td>
              </tr>
              <tr>
                <td><strong>GitHub public API</strong></td>
                <td>Read-only lookup of the public profile you volunteer via your GitHub username</td>
                <td>Public profile data for the username you gave us; we only read, never write</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Our infrastructure runs on Supabase in <Ph>AWS Mumbai (ap-south-1), India</Ph>. At
          launch, accounts and profiles are stored on Supabase’s managed PostgreSQL; passwords are
          handled by the Supabase authentication system and exist only as secure hashes. Live
          during the <strong>closed beta</strong>: registration and login run against an isolated
          in-memory staging store used for testing — it is not connected to our production database.
        </p>
        <p>
          Where processing involves a transfer outside the EU/EEA we apply the appropriate
          safeguards of GDPR Chapter V (such as Standard Contractual Clauses); for India, transfers
          follow the requirements of Section 16 of the DPDP Act, 2023. See Section 11 for details.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-cookies',
    title: 'Cookies & local storage',
    body: (
      <>
        <p>
          Quadly uses <strong>no cookies for tracking</strong> and runs no advertising or
          cross-site tracking scripts. We store only small local items in your browser’s
          localStorage:
        </p>
        <div className="legal-tablewrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th style={{ width: '34%' }}>Item</th>
                <th>What it holds</th>
                <th style={{ width: '30%' }}>Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>quadly:email</strong></td>
                <td>
                  The email you registered with, so the onboarding form can save you from retyping
                  it.
                </td>
                <td>Until you clear your browser storage</td>
              </tr>
              <tr>
                <td><strong>Session preferences</strong></td>
                <td>
                  A small item holding in-app session preferences <Ph>[item name to be
                  confirmed]</Ph>.
                </td>
                <td>Until you clear your browser storage</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Neither item can be read by other sites, and neither contains passwords or tracking
          identifiers. Clearing your browser storage removes both.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-retention',
    title: 'Retention',
    body: (
      <ul>
        <li>
          <strong>Accounts</strong> — kept until you request deletion; we honour deletion requests
          within 30 days.
        </li>
        <li>
          <strong>Onboarding profile</strong> — kept until you request deletion (within 30 days of
          the request).
        </li>
        <li>
          <strong>Ambassador applications</strong> — kept for up to 12 months from submission so we
          can consider you for current and future cohorts, then deleted. If you are selected, your
          data continues under the separate signed ambassador agreement.
        </li>
        <li>
          <strong>Technical logs</strong> — short-lived, deleted on a fixed schedule <Ph>deleted after 90 days</Ph>.
        </li>
      </ul>
    ),
  },
  {
    id: 'privacy-rights',
    title: 'Your rights & how to use them',
    body: (
      <>
        <p>
          <strong>Under the GDPR</strong> (users in the EU/EEA): access, rectification, erasure,
          restriction of processing, data portability, and objection to processing based on
          legitimate interests.
        </p>
        <p>
          <strong>Under the DPDP Act, 2023</strong> (users in India) you can: access a summary of
          your data and processing, ask for correction or completion, ask for erasure, nominate
          another individual to exercise your rights if you cannot act yourself, and raise a
          grievance (Section 13).
        </p>
        <p>
          To exercise any right, email {PRIV_EMAIL} from the address registered with your account.
          We may verify your identity before acting. Requests are handled free of charge; deletion
          requests are honoured <strong>within 30 days</strong>. Depending on where you are, you
          may also escalate a complaint to your local EU supervisory authority <Ph>your local data protection authority — we will point you to the right one</Ph> or to the Data Protection Board of India.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-children',
    title: 'Children & parental consent',
    body: (
      <>
        <p>
          Under India’s DPDP Act, 2023 anyone under 18 is a child, and processing a child’s
          personal data requires <strong>verifiable parental consent</strong>. Quadly does not
          knowingly process children’s data without that consent.
        </p>
        <p>
          During the beta, creating an account requires you to confirm your age (or that you have
          the necessary consent) at <Ph>18 (eighteen)</Ph>. If we learn that we
          hold a child’s data without the required parental consent, we will delete it.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-security',
    title: 'Security',
    body: (
      <>
        <p>
          <strong>What exists today (closed beta):</strong> accounts live in an isolated in-memory
          staging store used for testing. It is separate from any production database, resets
          regularly, and is reachable only from our service. Please do not place anything in the
          beta you would be uncomfortable having in a test environment — and do not reuse important
          passwords.
        </p>
        <p>
          <strong>What applies at launch:</strong> accounts and profiles are stored on our Supabase
          (PostgreSQL) database; passwords are handled by the Supabase authentication system and
          stored only as secure hashes — never in plain text. Data travels over encrypted
          connections (HTTPS/TLS), and access to production data is limited to the team members who
          need it <Ph>the founding team's access-restricted staging environment</Ph>.
        </p>
        <p>
          No system is perfectly secure. If something ever goes wrong, we will notify affected
          users as required by law, our regulator or us.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-transfers',
    title: 'International transfers',
    body: (
      <>
        <p>
          Our infrastructure — including the Supabase database, authentication and any LLM
          involvement in ambassador matching — runs in <Ph>AWS Mumbai (ap-south-1), India</Ph>.
        </p>
        <p>
          Processing may therefore occur outside India and outside the EU. For personal data
          protected by the GDPR, transfers outside the EU/EEA are covered by the safeguards of{' '}
          <strong>GDPR Chapter V</strong> (for example Standard Contractual Clauses or an adequacy
          decision, as applicable). For personal data protected by India’s DPDP Act, 2023,
          transfers follow <strong>Section 16</strong> of that Act and any requirements the
          Government specifies. We have listed in Section 5 every processor that could be
          involved in such a transfer.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-changes',
    title: 'Changes to this policy',
    body: (
      <>
        <p>
          Quadly is a beta product and parts of this policy — for example hosting regions or
          processor names — will be finalised as we approach launch. When we change this policy we
          will update the “Last updated” date at the top and post the new version on this page;
          material changes will be highlighted on the site before they take effect.
        </p>
        <p>
          Continued use of Quadly after a change takes effect means the updated policy applies to
          you. If you disagree with a change, you can stop using Quadly and ask us to delete your
          account (within 30 days, Section 8).
        </p>
      </>
    ),
  },
  {
    id: 'privacy-contact',
    title: 'Contact & grievance officer',
    body: (
      <>
        <p>
          <strong>Controller:</strong> Quadly <Ph>Quadly</Ph>, India.
        </p>
        <p>
          <strong>Privacy questions, rights requests and grievances:</strong> {PRIV_EMAIL}
        </p>
        <p>
          <strong>Grievance Officer</strong> (under India’s Information Technology Act, 2000 and
          the DPDP rules): <Ph>Grievance Officer · privacy@quadly.in</Ph>. We aim to
          acknowledge grievances quickly and resolve them within 30 days.
        </p>
      </>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Terms of Use — 12 sections                                          */
/* ------------------------------------------------------------------ */

const TERMS_SECTIONS = [
  {
    id: 'terms-acceptance',
    title: 'Acceptance',
    body: (
      <>
        <p>
          These Terms of Use (“Terms”) govern your use of the Quadly website and web app. By using
          Quadly or by creating an account, you agree to these Terms. If you do not agree, please
          don’t use Quadly.
        </p>
        <p>
          Quadly is in <strong>closed beta</strong>, so parts of the experience may be
          experimental. Program-specific rules (for example, the campus ambassador program in
          Section 5) apply on top of these Terms.
        </p>
      </>
    ),
  },
  {
    id: 'terms-about',
    title: 'What Quadly is',
    body: (
      <>
        <p>
          Quadly is a beta <strong>study and practice companion</strong> for students preparing for
          placements and internships — daily tasks, practice drills and guidance to help you build
          consistency.
        </p>
        <p>
          Quadly is an educational tool, not a recruitment or consultancy service.{' '}
          <strong>Quadly makes no guarantee of placements, interview calls, offers, or any other
          outcome.</strong> What and how you practise is up to you; results depend on factors
          entirely outside Quadly’s control. Content in the app is provided for study and practice
          purposes only and is not professional advice.
        </p>
      </>
    ),
  },
  {
    id: 'terms-eligibility',
    title: 'Eligibility & accounts',
    body: (
      <>
        <ul>
          <li>
            You must be at least <Ph>18 (eighteen)</Ph> — or the age of majority
            wherever you live — to hold an account, consistent with the age and parental-consent
            rules in our Privacy Policy (Section 9).
          </li>
          <li>
            Registration information (email and password) must be accurate and kept up to date. You
            create <strong>one account</strong> for yourself; creating accounts for others or
            multiple accounts for yourself is not allowed.
          </li>
          <li>
            You are responsible for guarding your password and for all activity under your account.
            Tell us at {PRIV_EMAIL} if you suspect someone else is using it.
          </li>
          <li>
            During the closed beta, accounts live in an isolated in-memory staging store and may be
            reset without notice (see Section 7).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'terms-use',
    title: 'Acceptable use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            <strong>Impersonate</strong> any person, college, or organisation, or misrepresent who
            you are or where you study — including in ambassador applications.
          </li>
          <li>
            Use <strong>automated scraping</strong>, bots, bulk downloaders or similar tools to
            access Quadly, or copy app content for use elsewhere.
          </li>
          <li>
            <strong>Abuse contests, squads, streaks or the ambassador program</strong> — for
            example with fake metrics, inflated reach claims, duplicate or shill applications, or
            points earned by manipulation rather than honest practice.
          </li>
          <li>
            Upload or share content that is unlawful, harassing, infringing, malicious or harmful
            to other users.
          </li>
          <li>
            Probe, scan or interfere with Quadly’s infrastructure, attempt unauthorised access, or
            disrupt the service for others.
          </li>
          <li>
            Resell, sublicense or commercially exploit Quadly or its content without our written
            permission.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'terms-ambassadors',
    title: 'Ambassador program terms',
    body: (
      <>
        <p>
          Applying to the campus ambassador program <strong>is not selection</strong>. Selection is
          Quadly’s decision, made at our discretion, based on your application and college presence.
        </p>
        <ul>
          <li>
            <strong>Tiers and stipends</strong> apply only after written confirmation from Quadly
            and execution of a separate signed agreement; nothing on the application form or in
            marketing material is an offer. Stipend amounts and tier structures are stated only in
            that confirmation and agreement.
          </li>
          <li>
            Ambassador <strong>titles are personal, non-transferable</strong>, and revocable at any
            time for misconduct, for misrepresenting your reach or your role at a college, or for
            violating these Terms.
          </li>
          <li>
            Application data you submit is processed per the consent you give on the application
            page, and handled as described in our Privacy Policy (Section 4).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'terms-ip',
    title: 'Intellectual property',
    body: (
      <>
        <p>
          Quadly’s name, logo, interface, copy, code and content are the property of{' '}
          <strong>Quadly</strong> <Ph>Quadly</Ph> and its licensors,
          and may not be copied, modified or commercially exploited without written permission.
        </p>
        <p>
          You keep ownership of the personal content you submit — your profile details, motivation
          text and application data. You grant us a limited licence to store, process and display
          it within Quadly for the purposes described in the Privacy Policy, which ends when you
          ask us to delete it.
        </p>
        <p>
          If you send us feedback or suggestions, you agree we may use them freely, without
          obligation or attribution.
        </p>
      </>
    ),
  },
  {
    id: 'terms-availability',
    title: 'Availability — “as is”',
    body: (
      <>
        <p>
          Quadly is provided <strong>“as is” and “as available”</strong>, in beta. It may contain
          bugs or be unavailable; features may be added, changed, suspended or discontinued at any
          time, with or without notice.
        </p>
        <p>
          During the closed beta, accounts and profile data live in an isolated in-memory staging
          store that <strong>resets regularly</strong>. Don’t rely on Quadly as the only copy of
          anything you care about, and don’t use a password that protects anything important.
        </p>
      </>
    ),
  },
  {
    id: 'terms-liability',
    title: 'Limitation of liability',
    body: (
      <>
        <p>
          To the maximum extent permitted by applicable law, Quadly and its team are not liable for
          any indirect, incidental, special, consequential or punitive damages — including lost
          opportunities, lost goodwill, <strong>missed placements or interview outcomes</strong>,
          or data loss — arising from or relating to your use of Quadly.
        </p>
        <p>
          Quadly is an educational tool: nothing we produce is a promise of employment, an
          internship, an interview, or any recruiting decision by any company. Where liability
          cannot be excluded by law, it is limited to the maximum extent that law allows.
        </p>
      </>
    ),
  },
  {
    id: 'terms-termination',
    title: 'Termination',
    body: (
      <>
        <p>
          <strong>By you:</strong> stop using Quadly at any time. To delete your account and its
          data, email {PRIV_EMAIL}; deletion requests are honoured within 30 days (and, during the
          beta, staging accounts are additionally erased whenever the staging store resets).
        </p>
        <p>
          <strong>By us:</strong> if you breach these Terms — notably acceptable use (Section 4) or
          ambassador conduct (Section 5) — we may suspend your account or terminate your access
          immediately. Where feasible, we will tell you why.
        </p>
        <p>
          Sections 6, 8, 9, 11 and 12 survive termination by either side.
        </p>
      </>
    ),
  },
  {
    id: 'terms-changes',
    title: 'Changes to these terms',
    body: (
      <>
        <p>
          As Quadly grows out of beta, these Terms will change. We will update the “Last updated”
          date at the top and post the new version on this page; material changes will be
          highlighted on the site before they take effect.
        </p>
        <p>
          Continued use of Quadly after a change takes effect means you accept the updated Terms.
          If you disagree, stop using Quadly and you may ask us to delete your account (Section 9).
        </p>
      </>
    ),
  },
  {
    id: 'terms-law',
    title: 'Governing law & disputes',
    body: (
      <>
        <p>
          These Terms are governed by the <strong>laws of India</strong>. Any dispute arising from
          them or your use of Quadly is subject to the exclusive jurisdiction of the competent
          courts at <strong>Hyderabad, Telangana</strong>.
        </p>
      </>
    ),
  },
  {
    id: 'terms-grievance',
    title: 'Grievance officer & contact',
    body: (
      <>
        <p>
          Under India’s Information Technology Act, 2000 and the rules under it, we designate a
          Grievance Officer to handle complaints about Quadly and these Terms:{' '}
          <Ph>Grievance Officer · privacy@quadly.in</Ph>.
        </p>
        <p>
          For everything else — including account deletion and data questions — write to{' '}
          {PRIV_EMAIL}. See our Privacy Policy for how we handle your data.
        </p>
      </>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */

const DOCS = {
  privacy: {
    title: 'Privacy Policy',
    sections: PRIVACY_SECTIONS,
    meta: [
      ['Controller', <>Quadly <Ph>Quadly</Ph></>],
      ['Contact', PRIV_EMAIL],
      ['Last updated', LAST_UPDATED],
      ['Frameworks', <>GDPR (EU) & DPDP Act, 2023 (India)</>],
    ],
  },
  terms: {
    title: 'Terms of Use',
    sections: TERMS_SECTIONS,
    meta: [
      ['Last updated', LAST_UPDATED],
      ['Governing law', <>Laws of India</>],
      ['Jurisdiction', <>Courts of Hyderabad, Telangana</>],
      ['Grievance Officer', <Ph>Quadly · hello@quadly.in (general) · privacy@quadly.in (data protection)</Ph>],
    ],
  },
};

function Toc({ sections }) {
  const jump = (event, id) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault(); // keep the hash router stable (no '/privacy#…')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <nav className="legal-toc" aria-label="On this page">
      <p className="legal-toc-title">On this page</p>
      <ol className="legal-toc-list">
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} onClick={(event) => jump(event, section.id)}>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function LegalPage({ kind }) {
  const doc = DOCS[kind] ?? DOCS.privacy;
  const rootRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [kind]);

  // Subtle entrance for everything above the fold; skipped under reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('.legal-fade', {
        y: 18,
        opacity: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power3.out',
      });
    }, rootRef);

    return () => ctx.revert();
  }, [kind]);

  return (
    <div className="legal-page" ref={rootRef}>
      <div className="legal-shell">
        <header className="legal-top">
          <a className="legal-logo" href="/" aria-label="Quadly home"><Logo /></a>
          <a className="legal-back" href="/">&larr; Back to home</a>
        </header>

        <p className="legal-kicker legal-fade">Legal</p>
        <h1 className="legal-title legal-fade">{doc.title}</h1>
        <p className="legal-updated-chip legal-fade">Last updated: {LAST_UPDATED}</p>

        <dl className="legal-meta legal-fade">
          {doc.meta.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <Toc sections={doc.sections} />

        <div className="legal-body">
          {doc.sections.map((section, index) => (
            <section className="legal-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-h`}>
              <h2 className="legal-h2" id={`${section.id}-h`}>
                <span className="legal-h-num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.title}
              </h2>
              {section.body}
            </section>
          ))}
        </div>

        <div className="legal-end">
          <small>
            &copy; {new Date().getFullYear()} Quadly <Ph>Quadly</Ph>. All rights reserved.
          </small>
          <a className="legal-back" href="/">&larr; Back to home</a>
        </div>
      </div>
    </div>
  );
}
