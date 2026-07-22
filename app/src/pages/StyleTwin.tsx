import { useState, useEffect, useCallback } from "react";
import { useCloset } from "../contexts/ClosetContext";
import { generateStyleProfile, type StyleProfile, type StylePersona } from "../lib/styleProfile";

interface TwinMatch {
  id: string;
  name: string;
  avatarEmoji: string;
  persona: StylePersona;
  matchPercentage: number;
  sharedItems: number;
  topColor: string;
}

const DEMO_MATCHES: TwinMatch[] = [
  {
    id: "twin-1",
    name: "Maya",
    avatarEmoji: "👩🏽‍🦱",
    persona: {
      label: "Streetwear Queen",
      emoji: "👑",
      description: "Bold, edgy, and always ahead of the curve",
    },
    matchPercentage: 87,
    sharedItems: 12,
    topColor: "#ef4444",
  },
  {
    id: "twin-2",
    name: "Sophie",
    avatarEmoji: "👩🏻",
    persona: {
      label: "Casual Minimalist",
      emoji: "🤍",
      description: "Clean lines, neutral tones, effortless style",
    },
    matchPercentage: 74,
    sharedItems: 8,
    topColor: "#d4c5a9",
  },
  {
    id: "twin-3",
    name: "Zara",
    avatarEmoji: "👩🏾",
    persona: {
      label: "Boho Dreamer",
      emoji: "🌿",
      description: "Free-spirited, romantic, and whimsical",
    },
    matchPercentage: 68,
    sharedItems: 6,
    topColor: "#5c6b3c",
  },
];

const INVITE_TEXT =
  "👯 Find your Style Twin on Attired! We match you with people who have similar wardrobes and body types so you can swap outfit ideas. Join me: https://attired.app";

export default function StyleTwin() {
  const { items } = useCloset();
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<TwinMatch[]>([]);
  const [hasMatched, setHasMatched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      setProfile(generateStyleProfile(items));
    }
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleFindMatch = useCallback(() => {
    if (items.length === 0) return;
    setIsMatching(true);
    setMatches([]);

    // Simulate matchmaking delay
    setTimeout(() => {
      setMatches(DEMO_MATCHES);
      setHasMatched(true);
      setIsMatching(false);
    }, 2200);
  }, [items.length]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INVITE_TEXT);
      setToast("🔗 Invite link copied!");
    } catch {
      setToast("Copy this: Find your Style Twin on Attired! 👯");
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Find your Style Twin on Attired",
          text: INVITE_TEXT,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  }, [handleCopyLink]);

  const persona = profile?.persona;

  return (
    <div className="page styletwin-page">
      <header className="page-header">
        <h2>Style Twin</h2>
        <p>Find your wardrobe soulmate</p>
      </header>

      {/* User's Style Persona */}
      {persona && (
        <div className="styletwin-persona-card">
          <div className="styletwin-persona-badge">
            <span className="styletwin-persona-emoji">{persona.emoji}</span>
            <div>
              <h3 className="styletwin-persona-label">{persona.label}</h3>
              <p className="styletwin-persona-desc">{persona.description}</p>
            </div>
          </div>
          <div className="styletwin-persona-stats">
            <div className="styletwin-stat">
              <span className="styletwin-stat-value">{profile?.wardrobeSize ?? 0}</span>
              <span className="styletwin-stat-label">items</span>
            </div>
            <div className="styletwin-stat">
              <span className="styletwin-stat-value">
                {profile?.categoryBreakdown.length ?? 0}
              </span>
              <span className="styletwin-stat-label">categories</span>
            </div>
            <div className="styletwin-stat">
              <span className="styletwin-stat-value">
                {profile?.dominantColors.length ?? 0}
              </span>
              <span className="styletwin-stat-label">palette</span>
            </div>
          </div>
        </div>
      )}

      {/* No closet items */}
      {items.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">👯</span>
          <h3>No closet, no twin</h3>
          <p>Upload your clothes to discover your Style Twin!</p>
        </div>
      )}

      {/* Find Match button */}
      {items.length > 0 && !hasMatched && !isMatching && (
        <div className="styletwin-cta-section">
          <button className="styletwin-find-btn" onClick={handleFindMatch}>
            <span className="styletwin-find-icon">🔮</span>
            <span>Find My Style Twin</span>
          </button>
        </div>
      )}

      {/* Matchmaking animation */}
      {isMatching && (
        <div className="styletwin-matching">
          <div className="styletwin-matching-animation">
            <span className="styletwin-match-avatar left">👤</span>
            <div className="styletwin-match-pulse" />
            <span className="styletwin-match-avatar right">👤</span>
          </div>
          <p className="styletwin-matching-text">Scanning for your Style Twin...</p>
          <div className="styletwin-matching-dots">
            <span className="styletwin-dot" />
            <span className="styletwin-dot" />
            <span className="styletwin-dot" />
          </div>
        </div>
      )}

      {/* Matches */}
      {hasMatched && !isMatching && matches.length > 0 && (
        <div className="styletwin-matches">
          <h3 className="styletwin-matches-heading">
            ✨ {matches.length} Style Twin{matches.length !== 1 ? "s" : ""} Found
          </h3>
          <div className="styletwin-matches-list">
            {matches.map((match) => (
              <div key={match.id} className="styletwin-match-card">
                <div className="styletwin-match-top">
                  <div className="styletwin-match-avatar-wrap">
                    <span className="styletwin-match-avatar-lg">
                      {match.avatarEmoji}
                    </span>
                    <span
                      className="styletwin-match-color-dot"
                      style={{ backgroundColor: match.topColor }}
                    />
                  </div>
                  <div className="styletwin-match-info">
                    <h4 className="styletwin-match-name">{match.name}</h4>
                    <span className="styletwin-match-persona">
                      {match.persona.emoji} {match.persona.label}
                    </span>
                  </div>
                  <div className="styletwin-match-score">
                    <span className="styletwin-match-pct">{match.matchPercentage}%</span>
                    <span className="styletwin-match-pct-label">match</span>
                  </div>
                </div>
                <div className="styletwin-match-details">
                  <div className="styletwin-match-detail-item">
                    <span className="styletwin-match-detail-icon">👗</span>
                    <span>{match.sharedItems} shared items</span>
                  </div>
                  <div className="styletwin-match-detail-item">
                    <span className="styletwin-match-detail-icon">🎨</span>
                    <span>Similar color palette</span>
                  </div>
                </div>
                <button
                  className="styletwin-swap-btn"
                  onClick={() =>
                    setToast(`💫 Swap request sent to ${match.name}! (demo)`)
                  }
                >
                  <span>🔄</span>
                  <span>Swap Ideas</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite a Friend section */}
      <div className="styletwin-invite-card">
        <div className="styletwin-invite-icon-wrap">
          <span className="styletwin-invite-icon">📨</span>
        </div>
        <h3 className="styletwin-invite-title">Find your real Style Twin</h3>
        <p className="styletwin-invite-desc">
          Invite friends to get matched with people who actually share your style
          — and swap outfit ideas together.
        </p>
        <div className="styletwin-invite-actions">
          <button className="styletwin-invite-btn primary" onClick={handleShare}>
            <span>📤</span>
            <span>Invite Friends</span>
          </button>
          <button className="styletwin-invite-btn secondary" onClick={handleCopyLink}>
            <span>🔗</span>
            <span>Copy Invite Link</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="share-toast">{toast}</div>}
    </div>
  );
}
