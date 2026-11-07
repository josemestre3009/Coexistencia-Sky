export function appUrl(path: string) {
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}/${path.replace(/^\/+/, "")}`;
}
