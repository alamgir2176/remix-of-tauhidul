import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { DirectoryGrid, PostCard } from "@/components/content-cards";
import { getDirectory, getPosts } from "@/lib/content";

/** Homepage section linking to every content section, with the latest writings. */
export function LibraryOverview() {
  const latest = getPosts().slice(0, 3);
  return (
    <section id="library" className="library-section section-space">
      <span className="section-mark" aria-hidden="true">04</span>
      <div className="section-label"><span>04 — Writing &amp; work</span><span>Words, projects and moments</span></div>
      <div className="library-head scroll-reveal">
        <h2 className="section-heading">Ideas, set down<br /><span className="font-editorial italic">on the page.</span></h2>
        <p className="section-intro">Original writings published here, work that lives elsewhere, official notices and photographs from my activities.</p>
      </div>
      <DirectoryGrid entries={getDirectory()} />
      {latest.length > 0 && (
        <div className="library-latest">
          <div className="library-latest-head">
            <span className="micro-label">Latest writings</span>
            <Link to="/writings" className="library-all">All writings <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <div className="card-grid">{latest.map((post) => <PostCard key={post.slug} post={post} />)}</div>
        </div>
      )}
    </section>
  );
}
