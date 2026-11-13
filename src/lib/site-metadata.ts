const LINKEDIN = "https://www.linkedin.com/in/md-tauhidul-islam-910612331";

/** Search engines read this structured profile to connect the page with the person and LinkedIn. */
export function profileJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "Md Tauhidul Islam",
      alternateName: "Tauhidul Islam",
      jobTitle: "Philosophy graduate",
      description:
        "A philosophy graduate in Dhaka writing about ideas, people and everyday life.",
      address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "Jahangirnagar University" },
      sameAs: [LINKEDIN],
    },
  };
}

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