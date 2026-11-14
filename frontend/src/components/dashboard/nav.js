// Shared clean-path navigation for dashboard workspaces: push the path,
// tell the shell a route change happened, land at the top.
export default function gotoRoute(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}
