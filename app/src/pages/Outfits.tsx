import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useCloset } from "../contexts/ClosetContext";
import { generateOutfits, type OutfitSuggestion } from "../lib/outfits";
import LookbookCard, { type CardVariant, type LookbookCardHandle } from "../components/LookbookCard";
import ShareMenu from "../components/ShareMenu";

const OCCASIONS = [
  "Date Night",
  "Job Interview",
  "Brunch",
  "Casual Friday",
  "Night Out",
  "Wedding Guest",
];

const LOADING_MESSAGES = [
  "Working our magic...",
  "Mixing and matching...",
  "Curating your look...",
  "Finding the perfect combo...",
  "Styling you up...",
  "Almost there...",
];

export default function Outfits() {
  const { items, selectedOccasion, setSelectedOccasion } = useCloset();
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Share menu state
  const [shareOutfit, setShareOutfit] = useState<OutfitSuggestion | null>(null);
  const [shareOutfitIdx, setShareOutfitIdx] = useState<number>(-1);

  // Refs for lookbook cards to access exportPng
  const cardRefs = useRef<Map<number, LookbookCardHandle>>(new Map());

  const setCardRef = useCallback((idx: number, handle: LookbookCardHandle | null) => {
    if (handle) {
      cardRefs.current.set(idx, handle);
    } else {
      cardRefs.current.delete(idx);
    }
  }, []);

  // Cycle through loading messages
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingMsg((prev) => {
        const idx = LOADING_MESSAGES.indexOf(prev);
        return LOADING_MESSAGES[(idx + 1) % LOADING_MESSAGES.length];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleOccasionSelect = (occasion: string) => {
    const next = selectedOccasion === occasion ? null : occasion;
    setSelectedOccasion(next);
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedOccasion || items.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setLoadingMsg(LOADING_MESSAGES[0]);

    try {
      const result = await generateOutfits(items, selectedOccasion);
      setOutfits(result);
      setHasGenerated(true);
    } catch (err) {
      console.error("Outfit generation failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [items, selectedOccasion]);

  const toggleLike = (outfitId: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(outfitId)) {
        next.delete(outfitId);
      } else {
        next.add(outfitId);
      }
      return next;
    });
  };

  const handleShare = useCallback((outfit: OutfitSuggestion, idx: number) => {
    setShareOutfit(outfit);
    setShareOutfitIdx(idx);
  }, []);

  const handleCloseShare = useCallback(() => {
    setShareOutfit(null);
    setShareOutfitIdx(-1);
  }, []);

  const handleExportPng = useCallback(async (): Promise<string> => {
    const handle = cardRefs.current.get(shareOutfitIdx);
    if (!handle) throw new Error("Card not found");
    return handle.exportPng();
  }, [shareOutfitIdx]);

  // No clothes at all — direct to closet
  if (items.length === 0 && !isGenerating) {
    return (
      <div className="page outfits-page">
        <header className="page-header">
          <h2>My Outfits</h2>
          <p>AI-generated looks for every occasion</p>
        </header>
        <div className="empty-state">
          <span className="empty-icon">✨</span>
          <h3>No outfits yet</h3>
          <p>Add clothes to your closet first, then we'll style you!</p>
          <Link to="/closet" className="cta-button" style={{ textDecoration: "none" }}>
            Go to Closet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page outfits-page">
      <header className="page-header">
        <h2>My Outfits</h2>
        <p>AI-generated looks for every occasion</p>
      </header>

      {/* Occasion selector */}
      <div className="occasion-section">
        <h3 className="occasion-heading">Pick an occasion</h3>
        <div className="occasion-pills">
          {OCCASIONS.map((occasion) => (
            <button
              key={occasion}
              className={`occasion-pill ${
                selectedOccasion === occasion ? "occasion-pill--active" : ""
              }`}
              onClick={() => handleOccasionSelect(occasion)}
              disabled={isGenerating}
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="generate-section">
        <button
          className={`generate-btn ${
            isGenerating ? "generate-btn--loading" : ""
          }`}
          disabled={!selectedOccasion || items.length === 0 || isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <>
              <span className="generate-spinner" />
              <span>{loadingMsg}</span>
            </>
          ) : (
            <>
              <span className="generate-icon">✨</span>
              <span>Generate Outfits</span>
            </>
          )}
        </button>
        {items.length > 0 && !selectedOccasion && !isGenerating && (
          <p className="generate-hint">Select an occasion above to get started</p>
        )}
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="loading-state">
          <div className="loading-animation">
            <span className="loading-sparkle">✨</span>
            <span className="loading-sparkle delay-1">👗</span>
            <span className="loading-sparkle delay-2">👔</span>
            <span className="loading-sparkle delay-3">✨</span>
          </div>
          <p className="loading-text">{loadingMsg}</p>
        </div>
      )}

      {/* Error state */}
      {error && !isGenerating && (
        <div className="error-state">
          <p>{error}</p>
          <button className="cta-button" onClick={handleGenerate}>
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {hasGenerated && !isGenerating && outfits.length > 0 && (
        <div className="outfits-results">
          <div className="results-header">
            <h3>
              {outfits.length} outfit{outfits.length !== 1 ? "s" : ""} for{" "}
              <span className="results-occasion">{selectedOccasion}</span>
            </h3>
          </div>
          <div className="outfits-list">
            {outfits.map((outfit, idx) => {
              const variant: CardVariant = idx % 2 === 0 ? "hero" : "gallery";
              return (
                <div key={outfit.id}>
                  <LookbookCard
                    ref={(handle) => setCardRef(idx, handle)}
                    outfit={outfit}
                    items={items}
                    variant={variant}
                  />
                  <div className="outfit-actions">
                    <button
                      className={`outfit-action-btn ${
                        liked.has(outfit.id) ? "outfit-action-btn--liked" : ""
                      }`}
                      onClick={() => toggleLike(outfit.id)}
                      aria-label={liked.has(outfit.id) ? "Unlike" : "Like"}
                    >
                      {liked.has(outfit.id) ? "❤️" : "🤍"}
                      <span>Like</span>
                    </button>
                    <button
                      className="outfit-action-btn"
                      aria-label="Share outfit"
                      onClick={() => handleShare(outfit, idx)}
                    >
                      <span>📤</span>
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Has clothes but hasn't generated yet */}
      {!hasGenerated && !isGenerating && items.length > 0 && (
        <div className="empty-state">
          <span className="empty-icon">✨</span>
          <h3>Ready to style you</h3>
          <p>Select an occasion and tap generate to see your outfits</p>
        </div>
      )}

      {/* Share Menu */}
      {shareOutfit && (
        <ShareMenu
          isOpen={shareOutfit !== null}
          onClose={handleCloseShare}
          onExportPng={handleExportPng}
          outfit={shareOutfit}
        />
      )}
    </div>
  );
}
