// Serves the built Astro site from ASSETS and handles the one API route.
// POST /api/form is wired in by the forms task; until then it is a stub.

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

export const routes = [
  {
    path: '/api/form',
    handle: async () => json({ ok: false, error: 'server' }, 500),
  },
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const route = routes.find((r) => r.path === url.pathname);
      if (!route) return json({ ok: false, error: 'not_found' }, 404);
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'POST' });
      }
      return route.handle(request, env, ctx, url);
    }
    return env.ASSETS.fetch(request);
  },
};
