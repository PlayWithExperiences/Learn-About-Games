export function joinBase(base: string, path = ''): string {
  const basePath = base.endsWith('/') ? base.slice(0, -1) : base;
  const relativePath = path.startsWith('/') ? path.slice(1) : path;

  return `${basePath}/${relativePath}`;
}

export function sitePath(path = ''): string {
  return joinBase(import.meta.env.BASE_URL, path);
}
