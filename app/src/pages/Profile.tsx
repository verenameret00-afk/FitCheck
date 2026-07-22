import { useMemo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCloset } from "../contexts/ClosetContext";
import { generateStyleProfile } from "../lib/styleProfile";
import { isPremium, unlockPremium } from "../lib/usage";

const STRIPE_LINK = "https://buy.stripe.com/00w28r9JDdoW76z1kAbMQ01";

const INVITE_TEXT =
  "👯 Find your Style Twin on FitCheck! We match you with people who have similar wardrobes and body types so you can swap outfit ideas. Join me: https://fitcheck.app";

export default function Profile() {
  const navigate = useNavigate();
  const { items } = useCloset();
  const [toast, setToast] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    setPremium(isPremium());
  }, []);

  const profile = useMemo(() => {
    if (items.length === 0) return null;
    return generateStyleProfile(items);
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on FitCheck",
          text: INVITE_TEXT,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INVITE_TEXT);
      setToast("🔗 Invite link copied!");
    } catch {
      setToast("📋 Copy this to invite friends!");
    }
  }, []);

  const handleUpgrade = useCallback(() => {
    window.open(STRIPE_LINK, "_blank", "noopener noreferrer");
  }, []);

  const handleTestUnlock = useCallback(() => {
    unlockPremium();
    setPremium(true);
    setToast("✨ Premium unlocked!");
  }, []);

  // No items — show empty state
  if (items.length === 0 || !profile) {
    return (
      <div className="page profile-page">
        <header className="page-header">
          <h2>Profile</h2>
          <p>Your style, your vibe</p>
        </header>
        <div className="empty-state">
          <span className="empty-icon">👤</span>
          <h3>Style Profile waiting</h3>
          <p>Upload clothes to generate your style profile and find your Style Twin!</p>
        </div>

        {/* Still show invite section */}
        <div className="styletwin-invite-card">
          <div className="styletwin-invite-icon-wrap">
            <span className="styletwin-invite-icon">📨</span>
          </div>
          <h3 className="styletwin-invite-title">Find your Style Twin</h3>
          <p className="styletwin-invite-desc">
            Invite friends to get matched with people who share your style.
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

        {toast && <div className="share-toast">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <header className="page-header">
        <h2>Profile</h2>
        <p>Your style, your vibe</p>
      </header>

      {/* Style Profile Card */}
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar">
            <span className="profile-avatar-emoji">{profile.persona.emoji}</span>
          </div>
          <div className="profile-identity">
            <h3 className="profile-persona-label">{profile.persona.label}</h3>
            <p className="profile-persona-desc">{profile.persona.description}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="profile-stats-row">
          <div className="profile-stat-box">
            <span className="profile-stat-num">{profile.wardrobeSize}</span>
            <span className="profile-stat-lbl">Items</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-num">{profile.categoryBreakdown.length}</span>
            <span className="profile-stat-lbl">Categories</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-num">{profile.dominantColors.length}+</span>
            <span className="profile-stat-lbl">Colors</span>
          </div>
        </div>
      </div>

      {/* Dominant Colors */}
      {profile.dominantColors.length > 0 && (
        <div className="profile-section">
          <h4 className="profile-section-title">Dominant Colors</h4>
          <div className="profile-colors-row">
            {profile.dominantColors.map((dc) => (
              <div key={dc.color} className="profile-color-item">
                <span
                  className="profile-color-swatch"
                  style={{ backgroundColor: dc.hex }}
                />
                <span className="profile-color-name">{dc.color}</span>
                <span className="profile-color-pct">{dc.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Style Breakdown */}
      {profile.styleVibes.length > 0 && (
        <div className="profile-section">
          <h4 className="profile-section-title">Style Breakdown</h4>
          <div className="profile-vibes-list">
            {profile.styleVibes.map((sv) => (
              <div key={sv.vibe} className="profile-vibe-item">
                <div className="profile-vibe-header">
                  <span className="profile-vibe-label">{sv.vibe}</span>
                  <span className="profile-vibe-pct">{sv.percentage}%</span>
                </div>
                <div className="profile-vibe-bar-track">
                  <div
                    className="profile-vibe-bar-fill"
                    style={{ width: `${sv.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {profile.categoryBreakdown.length > 0 && (
        <div className="profile-section">
          <h4 className="profile-section-title">Wardrobe Breakdown</h4>
          <div className="profile-categories-row">
            {profile.categoryBreakdown.map((cb) => (
              <div key={cb.category} className="profile-category-chip">
                <span className="profile-category-emoji">{cb.emoji}</span>
                <span className="profile-category-name">{cb.category}</span>
                <span className="profile-category-count">×{cb.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription */}
      <div className="profile-section">
        <h4 className="profile-section-title">Subscription</h4>
        <div className={`profile-subscription-card ${premium ? "profile-subscription-card--premium" : ""}`}>
          <div className="profile-subscription-info">
            <span className="profile-subscription-icon">{premium ? "👑" : "✨"}</span>
            <div>
              <h4 className="profile-subscription-plan">
                {premium ? "FitCheck Premium" : "Free Plan"}
                {premium && <span className="profile-premium-badge">Premium</span>}
              </h4>
              <p className="profile-subscription-desc">
                {premium
                  ? "Unlimited styling, closet organization, and shopping recommendations."
                  : "4 outfit generations per week."}
              </p>
            </div>
          </div>
          {premium ? (
            <button className="profile-subscription-btn secondary" onClick={handleTestUnlock}>
              Manage Subscription
            </button>
          ) : (
            <div className="profile-subscription-actions">
              <button className="profile-subscription-btn primary" onClick={handleUpgrade}>
                Upgrade — $29.99
              </button>
              <button className="profile-subscription-btn subtle" onClick={handleTestUnlock}>
                Test: Unlock Premium
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Find Style Twin CTA */}
      <div className="profile-twin-cta">
        <div className="profile-twin-cta-content">
          <span className="profile-twin-cta-icon">👯</span>
          <div>
            <h4>Find Your Style Twin</h4>
            <p>Match with people who share your wardrobe DNA</p>
          </div>
        </div>
        <button
          className="profile-twin-cta-btn"
          onClick={() => navigate("/styletwin")}
        >
          Go →
        </button>
      </div>

      {/* Invite section */}
      <div className="styletwin-invite-card">
        <div className="styletwin-invite-icon-wrap">
          <span className="styletwin-invite-icon">📨</span>
        </div>
        <h3 className="styletwin-invite-title">Invite Friends</h3>
        <p className="styletwin-invite-desc">
          Share FitCheck with friends to unlock real Style Twin matching.
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

      {toast && <div className="share-toast">{toast}</div>}
    </div>
  );
}
