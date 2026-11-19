import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { EXTERNAL_SECTIONS } from "@/lib/content-utils";

/** Links between the "writing & work" pages: all, blog, and each external section. */
export function TypeChips({ active }: { active: string }) {
  const { t } = useI18n();
  const cls = (key: string) => `type-chip${active === key ? " is-active" : ""}`;
  return (
    <nav className="type-chips" aria-label={t("Browse by type")}>
      <Link to="/library" className={cls("all")}>{t("All")}</Link>
      <Link to="/writings" className={cls("blog")}>{t("Blog")}</Link>
      {EXTERNAL_SECTIONS.map((s) => (
        <Link key={s.slug} to="/library/$section" params={{ section: s.slug }} className={cls(s.slug)}>{t(s.title)}</Link>
      ))}
    </nav>
  );
}
