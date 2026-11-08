// Every request goes through the /api prefix; in dev the Vite proxy
// forwards it to the backend, in production a reverse proxy should do the same.
export async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    // Backend not reachable: a plain, honest message instead of a cryptic one.
    throw new Error('Can’t reach the Quadly server — make sure `npm run dev` is running.');
  }
  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new Error(message);
  }
  return res.json();
}
