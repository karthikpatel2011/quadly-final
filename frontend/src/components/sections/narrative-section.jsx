// Streak-art statement section — black panel, diagonal light-streak artwork,
// overlapping avatar chips, display statement and CTA.
import './narrative-section.css';
import { Button } from '../ui.jsx';

const CHIPS = ['pink', 'lime', 'green', 'amber', 'blue'];

export default function NarrativeSection() {
  return (
    <section className="narrative">
      <div className="narrative__panel">
        <div className="narrative__avatars">
          {CHIPS.map((chip) => (
            <span key={chip} className={`narrative__avatar narrative__avatar--${chip}`} />
          ))}
        </div>
        <p className="narrative__label">Plans, Squads and Parent Reports</p>
        <h2 className="narrative__title">
          Placement is
          <br />
          a team sport
        </h2>
        <Button variant="primary" size="md" className="narrative__cta" href="/join">
          Join Waitlist
        </Button>
      </div>
      <img className="narrative__art narrative__art--tl" src="/art/narrative-left-streaks.png" alt="" aria-hidden="true" />
      <img className="narrative__art narrative__art--bl" src="/art/narrative-bottom-left.png" alt="" aria-hidden="true" />
      <img className="narrative__art narrative__art--r" src="/art/narrative-right.png" alt="" aria-hidden="true" />
    </section>
  );
}
