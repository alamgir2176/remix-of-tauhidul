/** Only configured public HTTPS addresses belong in canonical/share metadata. */
export function publicHomepage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return `${url.origin}/`;
  } catch {
    return undefined;
  }
}