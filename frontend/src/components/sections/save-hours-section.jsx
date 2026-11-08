import './save-hours-section.css';
import { SectionHead } from '../ui.jsx';

/* Small inline line icons — simple strokes, inherit chip text color. */
function IconBase({ children }) {
  return (
    <svg
      className="sh-chip__icon"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const IconChecklist = () => (
  <IconBase>
    <path d="M4.5 7l1.8 1.8L9.5 5.6" />
    <path d="M13.5 7.5H20" />
    <path d="M4.5 16.5l1.8 1.8 3.2-3.2" />
    <path d="M13.5 17H20" />
  </IconBase>
);

const IconGauge = () => (
  <IconBase>
    <path d="M5.5 16.5a7.5 7.5 0 1 1 13 0" />
    <path d="M12 16l3.2-4.4" />
    <circle cx="12" cy="16" r="1.3" />
  </IconBase>
);

const IconFlame = () => (
  <IconBase>
    <path d="M12 3.5c.9 2.7 3.3 4.1 4.6 6.3 1.7 3-.2 7.7-4.6 7.7s-6.3-4.7-4.6-7.7C8.7 7.6 11.1 6.2 12 3.5z" />
    <path d="M12 17.5c-1.6 0-2.6-1.3-2.1-2.8.3-.9 1.2-1.5 2.1-2.6.9 1.1 1.8 1.7 2.1 2.6.5 1.5-.5 2.8-2.1 2.8z" />
  </IconBase>
);

const IconStopwatch = () => (
  <IconBase>
    <circle cx="12" cy="14" r="6.5" />
    <path d="M12 7.5V5" />
    <path d="M9.5 3.5h5" />
    <path d="M12 14l2.8-2.8" />
  </IconBase>
);

const IconSparkle = () => (
  <IconBase>
    <path d="M11 4l1.6 4.4L17 10l-4.4 1.6L11 16l-1.6-4.4L5 10l4.4-1.6L11 4z" />
    <path d="M17.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
  </IconBase>
);

const IconWrench = () => (
  <IconBase>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </IconBase>
);

const IconBook = () => (
  <IconBase>
    <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
    <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
  </IconBase>
);

const IconChart = () => (
  <IconBase>
    <path d="M5 20v-9" />
    <path d="M12 20V4" />
    <path d="M19 20v-6" />
  </IconBase>
);

const IconChat = () => (
  <IconBase>
    <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z" />
    <circle cx="8.5" cy="11.5" r="0.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="11.5" r="0.4" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="11.5" r="0.4" fill="currentColor" stroke="none" />
  </IconBase>
);

const CHIPS = [
  // Row 1
  { label: 'Daily 3 Tasks', grad: 'amber', icon: IconChecklist, className: 'sh-chip--daily3' },
  { label: 'Readiness Score', grad: 'green', icon: IconGauge, className: 'sh-chip--readiness' },
  { label: 'Squad Streak', grad: 'mint', icon: IconFlame, className: 'sh-chip--streak' },
  // Row 2
  { label: 'Mock Drive', grad: 'orange', icon: IconStopwatch, className: 'sh-chip--mock' },
  { label: 'Catch the AI', grad: 'lime', icon: IconSparkle, className: 'sh-chip--catch' },
  { label: 'Project Doctor', grad: 'blue', icon: IconWrench, className: 'sh-chip--doctor' },
  // Row 3
  { label: 'Live Syllabus', grad: 'purple', icon: IconBook, className: 'sh-chip--syllabus' },
  { label: 'Parent Report', grad: 'sky', icon: IconChart, className: 'sh-chip--report' },
  { label: 'WhatsApp Nudges', grad: 'pink', icon: IconChat, className: 'sh-chip--nudges' },
];

export default function SaveHoursSection() {
  return (
    <section className="save-hours">
      <div className="save-hours__head">
        <SectionHead
          title="Save hours"
          sub="Focus on solving, not planning — your Coach agent picks today's three tasks, and the evening check-in keeps streaks, squads, and parents in the loop."
        />
      </div>

      <div className="save-hours__field">
        {CHIPS.map(({ label, grad, icon: Icon, className }) => (
          <div key={label} className={`sh-chip sh-chip--${grad} ${className}`}>
            <Icon />
            <span className="sh-chip__label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
