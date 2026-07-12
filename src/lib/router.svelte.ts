function getPath(): string {
  return location.hash.slice(1) || '/home';
}

export const router = $state({ path: getPath() });

window.addEventListener('hashchange', () => {
  router.path = getPath();
  window.scrollTo(0, 0);
});

export function go(path: string): void {
  location.hash = path;
}

/** matche un pattern "/workout/:id/:idx" contre le chemin courant, renvoie les params ou null */
export function match(pattern: string, path: string): Record<string, string> | null {
  const keys: string[] = [];
  const rx = new RegExp('^' + pattern.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
  const m = path.match(rx);
  if (!m) return null;
  const params: Record<string, string> = {};
  keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
  return params;
}
