import './workflow-section.css';
import { FeatureCard, SectionHead } from '../ui.jsx';

/* Card 1 art — daily-plan topic tiles (token gradients) */
const PLAN_TILES = [
  ['DSA', 'var(--chip-purple-a)', 'var(--chip-purple-b)'],
  ['Aptitude', 'var(--chip-amber-a)', 'var(--chip-amber-b)'],
  ['DBMS', 'var(--chip-green-a)', 'var(--chip-green-b)'],
  ['ML', 'var(--chip-lime-a)', 'var(--chip-lime-b)'],
];

/* Card 3 art — squad timeline clip blocks (green gradient shades) */
const SQUAD_CLIPS = [
  'linear-gradient(180deg, var(--chip-green-a), var(--chip-green-b))',
  'linear-gradient(180deg, var(--chip-mint-a), var(--chip-mint-b))',
  'linear-gradient(180deg, var(--chip-lime-a), var(--chip-lime-b))',
  'linear-gradient(180deg, var(--chip-green-b), var(--chip-mint-b))',
  'linear-gradient(180deg, var(--chip-mint-a), var(--chip-green-b))',
  'linear-gradient(180deg, var(--chip-lime-b), var(--chip-mint-a))',
];

export default function WorkflowSection() {
  return (
    <section className="wf-section">
      <div className="container">
        <SectionHead
          title="Enjoy a smarter workflow"
          sub="Quadly builds the habit with a daily plan, then delivers value with your Readiness Score, mock interviews, and a squad that keeps you coming back."
        />

        <div className="wf-grid">
          <FeatureCard
            className="wf-card"
            art={
              <div className="wf-plan" aria-hidden="true">
                {PLAN_TILES.map(([label, from, to]) => (
                  <span
                    key={label}
                    className="wf-plan__tile"
                    style={{ background: `linear-gradient(180deg, ${from}, ${to})` }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            }
          >
            <h3>Placement Plan and Readiness Score</h3>
            <p>
              Takes a 20-minute skill check, maps your strong and weak topics,
              and builds a 30-45 minute daily plan that rebuilds itself when
              life happens.
            </p>
          </FeatureCard>

          <FeatureCard
            className="wf-card"
            art={
              <div className="wf-score" aria-hidden="true">
                <span className="wf-score__glow" />
                <span className="wf-score__num">90</span>
              </div>
            }
          >
            <h3>Catch the AI</h3>
            <p>
              One 5-minute daily task: AI-written code with a planted mistake.
              Find it, explain it, and share your score.
            </p>
          </FeatureCard>

          <FeatureCard
            className="wf-card wf-card--squads"
            art={
              <div className="wf-timeline" aria-hidden="true">
                <div className="wf-timeline__tags">
                  <span className="wf-tag wf-tag--purple">Squad A</span>
                  <span className="wf-tag wf-tag--mint">Squad B</span>
                </div>
                <div className="wf-timeline__clips">
                  {SQUAD_CLIPS.map((bg, i) => (
                    <span key={i} className="wf-clip" style={{ background: bg }} />
                  ))}
                </div>
                <div className="wf-timeline__wave" />
              </div>
            }
          >
            <h3>Squads</h3>
            <p>
              Join a squad of 3 to 5 with a shared streak, weekly
              squad-vs-squad ranking, and a nudge the moment someone slips.
            </p>
          </FeatureCard>

          <FeatureCard
            className="wf-card"
            art={
              <div className="wf-twin">
                <div className="wf-twin__pills">
                  <span className="wf-pill wf-pill--active">DSA</span>
                  <span className="wf-pill">Projects</span>
                  <span className="wf-pill">HR</span>
                </div>
                <div className="wf-twin__photo">
                  <img
                    src="/art/caption-photo.png"
                    alt="Mock interview practice with a caption prompt"
                  />
                  <span className="wf-twin__caption">Why should we hire you?</span>
                </div>
              </div>
            }
          >
            <h3>Interview Twin</h3>
            <p>
              Upload your resume, pick a target company, and practice DSA,
              projects, and HR rounds with follow-ups on your weak spots.
            </p>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
