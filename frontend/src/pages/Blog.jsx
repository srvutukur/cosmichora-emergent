import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { api.get("/blogs").then((r) => setPosts(r.data)); }, []);

  return (
    <div data-testid="blog-page" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="max-w-3xl">
        <div className="eyebrow mb-4">Journal</div>
        <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
          Notes from the observatory.
        </h1>
      </div>
      <div className="mt-14 grid md:grid-cols-2 gap-10">
        {posts.map((p) => (
          <article key={p.id} data-testid={`blog-card-${p.slug}`}>
            <div className="aspect-[16/10] mb-6" style={{ background: "var(--beige)" }} />
            <div className="eyebrow mb-3">{(p.tags || []).join(" · ")}</div>
            <h2 className="font-display text-3xl mb-3" style={{ color: "var(--obsidian)" }}>
              <Link to={`/blog/${p.slug}`}>{p.title}</Link>
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--charcoal)" }}>{p.excerpt}</p>
            <Link to={`/blog/${p.slug}`} className="text-xs uppercase tracking-widest" style={{ color: "var(--brass)" }}>
              Read essay →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
