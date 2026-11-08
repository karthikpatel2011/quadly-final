/* Brand lockup — the script wordmark + diamond mark as a transparent PNG
   served from /art/. Every header and footer renders this instead of
   styled text, so the brand reads identically everywhere. */
export default function Logo({ alt = 'quadly', className = '' }) {
  return (
    <img
      className={className}
      src="/art/quadly-logo.png"
      alt={alt}
      draggable="false"
    />
  );
}
