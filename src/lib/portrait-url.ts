export function portraitUrl(asset: { url: string; original_filename: string }) {
  const base = import.meta.env['VITE_PORTRAIT_BASE_URL'];
  return base ? `${base.replace(/\/$/, "")}/${asset.original_filename}` : asset.url;
}