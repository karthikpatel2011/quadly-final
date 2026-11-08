import './backed-cta-section.css';

/* Wordmarks are recreated as styled text — no image assets. */
const LOGOS_ROW_ONE = [
  { text: 'r/developersIndia', className: 'backed-cta__mark backed-cta__mark--reddit' },
  { text: 'WhatsApp', className: 'backed-cta__mark backed-cta__mark--whatsapp' },
  { text: 'discord', className: 'backed-cta__mark backed-cta__mark--discord' },
  { text: 'Telegram', className: 'backed-cta__mark backed-cta__mark--telegram' },
];

const GROUPS = [
  'Campus Ambassadors',
  'Placement Cells',
  'E-Cells',
  'Meme Pages',
  'Study Circles',
];

export default function BackedCtaSection() {
  return (
    <section className="backed-cta">
      <div className="backed-cta__wall">
        <p className="backed-cta__label">Students and squads from</p>
        <div className="backed-cta__row backed-cta__row--one">
          {LOGOS_ROW_ONE.map((logo) => (
            <span key={logo.text} className={logo.className}>
              {logo.text}
            </span>
          ))}
        </div>
        <div className="backed-cta__row backed-cta__row--two">
          {GROUPS.map((group) => (
            <span key={group} className="backed-cta__mark backed-cta__mark--group">
              {group}
            </span>
          ))}
        </div>
      </div>

      <a className="backed-cta__pill" href="/join">
        <span className="backed-cta__pill-glow" aria-hidden="true" />
        <span className="backed-cta__pill-text">Join the Waitlist</span>
      </a>
    </section>
  );
}
