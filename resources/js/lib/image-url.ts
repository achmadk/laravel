export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/storage/")) {
    return path;
  }

  return `/storage/${path.replace(/^\//, "")}`;
}
