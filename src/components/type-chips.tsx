import { Link } from "@tanstack/react-router";
import { EXTERNAL_SECTIONS } from "@/lib/content-utils";

/** Links between the "writing & work" pages: all, blog, and each external section. */
export function TypeChips({ active }: { active: string }) {
  const cls = (key: string) => `type-chip${active === key ? " is-active" : ""}`;
  return (
    <nav className="type-chips" aria-label="Browse by type">
      <Link to="/library" className={cls("all")}>All</Link>
      <Link to="/writings" className={cls("blog")}>Blog</Link>
      {EXTERNAL_SECTIONS.map((s) => (
        <Link key={s.slug} to="/library/$section" params={{ section: s.slug }} className={cls(s.slug)}>{s.title}</Link>
      ))}
    </nav>
  );
}
