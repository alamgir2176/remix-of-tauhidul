/**
 * Portraits live in public/portraits/ and are served at /portraits/<file>.
 * Set VITE_PORTRAIT_BASE_URL only if they are hosted somewhere else.
 */
export function portraitUrl(asset: { url: string; original_filename: string }) {
  const base = import.meta.env['VITE_PORTRAIT_BASE_URL'] || "/portraits";
  return `${base.replace(/\/$/, "")}/${asset.original_filename}`;
}
