import { useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import { toPng } from "html-to-image";
import type { OutfitSuggestion } from "../lib/outfits";
import type { ClosetItem } from "../contexts/ClosetContext";

export type CardVariant = "hero" | "gallery";

export interface LookbookCardHandle {
  /** Export the card as a PNG data URL */
  exportPng: () => Promise<string>;
}

interface LookbookCardProps {
  outfit: OutfitSuggestion;
  items: ClosetItem[];
  variant: CardVariant;
}

const BADGE_EMOJI: Record<string, string> = {
  "date night": "💕",
  "job interview": "💼",
  brunch: "🌸",
  "casual friday": "👟",
  "night out": "🌙",
  "wedding guest": "🥂",
};

function getBadgeEmoji(occasion: string): string {
  return BADGE_EMOJI[occasion.toLowerCase()] ?? "✨";
}

const LookbookCard = forwardRef<LookbookCardHandle, LookbookCardProps>(
  function LookbookCard({ outfit, items, variant }, ref) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const matchedItems = outfit.itemIds
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is ClosetItem => i != null);

    const badgeEmoji = getBadgeEmoji(outfit.occasion);

    const exportPng = useCallback(async (): Promise<string> => {
      if (!cardRef.current) {
        throw new Error("Card element not mounted");
      }
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#0a0a0b",
      });
      return dataUrl;
    }, []);

    // Expose exportPng to parent via ref
    useImperativeHandle(ref, () => ({ exportPng }), [exportPng]);

    const handleExport = useCallback(async () => {
      if (isExporting) return;
      setIsExporting(true);
      try {
        const dataUrl = await exportPng();
        const link = document.createElement("a");
        link.download = `attired-${outfit.name.toLowerCase().replace(/\s+/g, "-")}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setIsExporting(false);
      }
    }, [outfit.name, isExporting, exportPng]);

    return (
      <div className="lookbook-wrapper">
        {/* The card DOM node — captured by html-to-image */}
        <div
          ref={cardRef}
          className={`lookbook-card lookbook-card--${variant}`}
        >
          {/* Background gradient overlay */}
          <div className="lookbook-bg" />

          {/* Top bar: occasion badge + vibe rating */}
          <div className="lookbook-top">
            <span className="lookbook-badge">
              {badgeEmoji} {outfit.occasion}
            </span>
            <div className="lookbook-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`lookbook-star ${s <= outfit.vibeRating ? "lookbook-star--on" : ""}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Card body — differs by variant */}
          {variant === "hero" ? (
            <HeroLayout outfit={outfit} items={matchedItems} />
          ) : (
            <GalleryLayout outfit={outfit} items={matchedItems} />
          )}

          {/* Description */}
          <p className="lookbook-desc">{outfit.description}</p>

          {/* Watermark */}
          <div className="lookbook-watermark">
            <span className="lookbook-watermark-icon">✨</span>
            <span>Styled by Attired</span>
          </div>
        </div>

        {/* Export button — outside the captured card */}
        <button
          className="lookbook-export-btn"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className="generate-spinner" />
              Exporting...
            </>
          ) : (
            <>
              <span>📥</span>
              Download Card
            </>
          )}
        </button>
      </div>
    );
  },
);

export default LookbookCard;

/* ── Hero Layout ── */
function HeroLayout({
  outfit,
  items,
}: {
  outfit: OutfitSuggestion;
  items: ClosetItem[];
}) {
  const heroItem = items[0];
  const restItems = items.slice(1);

  return (
    <>
      <div className="lookbook-hero-area">
        {heroItem ? (
          <img
            className="lookbook-hero-img"
            src={heroItem.dataUrl}
            alt={outfit.name}
          />
        ) : (
          <div className="lookbook-hero-placeholder">
            <span>✨</span>
          </div>
        )}
        <div className="lookbook-hero-overlay">
          <h3 className="lookbook-outfit-name">{outfit.name}</h3>
        </div>
      </div>
      {restItems.length > 0 && (
        <div className="lookbook-items-row">
          {restItems.map((item) => (
            <div key={item.id} className="lookbook-item-thumb">
              <img src={item.dataUrl} alt={item.name} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Gallery Layout ── */
function GalleryLayout({
  outfit,
  items,
}: {
  outfit: OutfitSuggestion;
  items: ClosetItem[];
}) {
  // Take up to 4 items for a 2×2 grid
  const gridItems = items.slice(0, 4);
  const remaining = Math.max(0, 4 - gridItems.length);

  return (
    <div className="lookbook-gallery">
      <div className="lookbook-gallery-grid">
        {gridItems.map((item) => (
          <div key={item.id} className="lookbook-gallery-cell">
            <img src={item.dataUrl} alt={item.name} />
          </div>
        ))}
        {/* Fill empty slots with styled placeholders */}
        {Array.from({ length: remaining }).map((_, i) => (
          <div key={`empty-${i}`} className="lookbook-gallery-cell lookbook-gallery-cell--empty">
            <span>✦</span>
          </div>
        ))}
      </div>
      <div className="lookbook-gallery-label">
        <h3 className="lookbook-outfit-name">{outfit.name}</h3>
      </div>
    </div>
  );
}
