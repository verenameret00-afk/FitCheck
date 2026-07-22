import { useState, useCallback, useRef } from "react";
import { DEMO_POSTS, type CommunityPost } from "../lib/communityData";
import LookbookCard, { type LookbookCardHandle } from "../components/LookbookCard";
import { isPremium } from "../lib/usage";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/00w28r9JDdoW76z1kAbMQ01";

export default function Community() {
  const premium = isPremium();

  // ── Free user: premium upsell page ──
  if (!premium) {
    return (
      <div className="page community-upsell-page">
        <div className="community-upsell-card">
          <div className="community-upsell-icon">💬</div>
          <h2 className="community-upsell-heading">
            Community is a Premium Feature
          </h2>
          <p className="community-upsell-body">
            Connect with your Style Twins, share outfits, and get inspired.
            Upgrade to unlock.
          </p>
          <a
            className="paywall-cta"
            href={STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            Upgrade — $29.99
          </a>
          <p className="community-upsell-hint">
            Already paid?{" "}
            <a href="/success" className="profile-complete-link">
              Complete your upgrade →
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── Premium user: full community feed ──
  const [posts, setPosts] = useState<CommunityPost[]>(DEMO_POSTS);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);

  // Refs for LookbookCard exports (not used for export in feed, but needed by component)
  const cardRefs = useRef<Map<string, LookbookCardHandle>>(new Map());

  const setCardRef = useCallback((postId: string, handle: LookbookCardHandle | null) => {
    if (handle) {
      cardRefs.current.set(postId, handle);
    } else {
      cardRefs.current.delete(postId);
    }
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
        // Trigger animation
        setAnimatingLike(postId);
        setTimeout(() => setAnimatingLike(null), 400);
      }
      return next;
    });

    // Update like count in posts
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = likedPosts.has(postId);
          return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 };
        }
        return p;
      }),
    );
  }, [likedPosts]);

  const toggleComments = useCallback((postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

  const formatLikes = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return String(count);
  };

  return (
    <div className="page community-page">
      <header className="page-header">
        <h2>Community</h2>
        <p>See what your Style Twins are wearing</p>
      </header>

      {/* Feed */}
      <div className="community-feed">
        {posts.map((post) => {
          const isLiked = likedPosts.has(post.id);
          const isExpanded = expandedComments.has(post.id);
          const isAnimating = animatingLike === post.id;

          return (
            <article key={post.id} className="community-post">
              {/* Author header */}
              <div className="community-post-header">
                <div className="community-post-author">
                  <span className="community-post-avatar">
                    {post.author.avatarEmoji}
                  </span>
                  <div className="community-post-author-info">
                    <span className="community-post-name">
                      {post.author.name}
                    </span>
                    <span className="community-post-persona">
                      {post.author.persona.emoji} {post.author.persona.label}
                    </span>
                  </div>
                </div>
                <span className="community-post-time">{post.timestamp}</span>
              </div>

              {/* Lookbook Card */}
              <div className="community-post-card">
                <LookbookCard
                  ref={(handle) => setCardRef(post.id, handle)}
                  outfit={post.outfit}
                  items={post.items}
                  variant="gallery"
                />
              </div>

              {/* Actions */}
              <div className="community-post-actions">
                <button
                  className={`community-action-btn ${isLiked ? "community-action-btn--liked" : ""} ${isAnimating ? "community-action-btn--animating" : ""}`}
                  onClick={() => toggleLike(post.id)}
                  aria-label={isLiked ? "Unlike" : "Like"}
                >
                  <span className="community-action-icon">
                    {isLiked ? "❤️" : "🤍"}
                  </span>
                  <span className="community-action-count">
                    {formatLikes(isLiked ? post.likes + 1 : post.likes)}
                  </span>
                </button>

                <button
                  className="community-action-btn"
                  onClick={() => toggleComments(post.id)}
                  aria-label="Comments"
                >
                  <span className="community-action-icon">💬</span>
                  <span className="community-action-count">
                    {post.comments.length}
                  </span>
                </button>
              </div>

              {/* Comments section */}
              {isExpanded && (
                <div className="community-comments">
                  {/* Divider */}
                  <div className="community-comments-divider" />

                  {post.comments.map((comment) => (
                    <div key={comment.id} className="community-comment">
                      <span className="community-comment-avatar">
                        {comment.authorAvatar}
                      </span>
                      <div className="community-comment-body">
                        <div className="community-comment-meta">
                          <span className="community-comment-name">
                            {comment.authorName}
                          </span>
                          <span className="community-comment-time">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="community-comment-text">{comment.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add comment hint */}
                  <div className="community-comment-hint">
                    <span>💬</span>
                    <span>Comments are read-only in demo mode</span>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <button
        className="community-fab"
        aria-label="Post your outfit"
        onClick={() => {
          // Demo: scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <span className="community-fab-icon">✨</span>
        <span className="community-fab-label">Post Your Outfit</span>
      </button>
    </div>
  );
}
