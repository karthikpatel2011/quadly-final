// Footer section — giant 3D wordmark cut off at the bottom edge.
import './footer-section.css';
import Logo from '../Logo.jsx';

const USEFUL_PRIMARY = [
  { label: 'Home', href: '/', muted: false },
  { label: 'Ambassadors', href: '/ambassadors', muted: true },
  { label: 'Careers', href: '/careers', muted: true },
];

const USEFUL_LEGAL = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
];

function LinkList({ items, className = '' }) {
  return (
    <ul className={`footer-list ${className}`.trim()}>
      {items.map((item) => (
        <li key={item.label}>
          <a
            className={`footer-link${item.muted ? ' footer-link--muted' : ''}`}
            href={item.href}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function FooterSection() {
  return (
    <footer className="footer-section">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-wordmark"><Logo /></div>
          <p className="footer-statement">
            Getting India placed,
            <br />
            one day at a time
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h3 className="footer-col-header">Useful</h3>
            <LinkList items={USEFUL_PRIMARY} />
            <LinkList items={USEFUL_LEGAL} className="footer-list--legal" />
          </div>
        </div>
      </div>

      <div className="footer-3d" aria-hidden="true">
        <div className="footer-3d-inner">
          <img className="footer-3d-logo" src="/art/quadly-logo.png" alt="" draggable="false" />
        </div>
      </div>
    </footer>
  );
}
