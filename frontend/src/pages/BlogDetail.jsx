import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  useEffect(() => {
    api.get(`/blogs/${slug}`).then((r) => setPost(r.data)).catch(() => setPost(false));
  }, [slug]);

  if (post === false) return <div className="max-w-3xl mx-auto py-40 text-center font-display text-3xl">Essay not found.</div>;
  if (!post) return <div className="max-w-3xl mx-auto py-40 text-center">Loading…</div>;

  return (
    <article data-testid="blog-detail-page" className="max-w-3xl mx-auto px-6 py-20 md:py-28">
      <Link to="/blog" className="eyebrow" style={{ color: "var(--brass)" }}>← Back to Journal</Link>
      <h1 className="mt-6 font-display font-light text-4xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
        {post.title}
      </h1>
      <div className="mt-4 text-xs" style={{ color: "var(--charcoal)" }}>
        {post.author} · {new Date(post.created_at).toLocaleDateString()}
      </div>
      <div className="mt-12 prose text-base leading-relaxed whitespace-pre-line" style={{ color: "var(--charcoal)" }}>
        {post.content}
      </div>
    </article>
  );
}
