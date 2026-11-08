import './ui.css';

/* Shared primitives — every section imports from here, never rebuilds them. */

export function Button({ variant = 'primary', size = 'md', href = '#', children, className = '', ...rest }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag href={href} className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionHead({ title, sub, className = '' }) {
  return (
    <header className={`section-head ${className}`}>
      <h2 className="section-head__title">{title}</h2>
      {sub ? <p className="section-head__sub">{sub}</p> : null}
    </header>
  );
}

export function FeatureCard({ className = '', art = null, children }) {
  return (
    <article className={`feature-card ${className}`}>
      {art ? <div className="feature-card__art">{art}</div> : null}
      <div className="feature-card__body">{children}</div>
    </article>
  );
}
