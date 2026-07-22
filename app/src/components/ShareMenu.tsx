import { useState, useCallback, useEffect } from "react";
import type { OutfitSuggestion } from "../lib/outfits";

export interface ShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** Callback that returns the lookbook card as a PNG data URL */
  onExportPng: () => Promise<string>;
  outfit: OutfitSuggestion;
}

type ShareOptionKey = "instagram" | "tiktok" | "download" | "copy" | "native";

interface ShareOption {
  key: ShareOptionKey;
  label: string;
  emoji: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

const SHARE_OPTIONS: ShareOption[] = [
  { key: "native", label: "Share", emoji: "📤", mobileOnly: true },
  { key: "instagram", label: "Instagram", emoji: "📸", mobileOnly: true },
  { key: "tiktok", label: "TikTok", emoji: "🎵", mobileOnly: true },
  { key: "download", label: "Download", emoji: "💾" },
  { key: "copy", label: "Copy Caption", emoji: "📋" },
];

/** Detect if the user is on a mobile device */
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Check if Instagram Stories URL scheme is available */
function canOpenInstagram(): boolean {
  return typeof window !== "undefined" && "instagram-stories" in window;
}

/** Generate a ready-to-post caption for the outfit */
function generateShareCaption(outfit: OutfitSuggestion): string {
  const occasion = outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1);
  const vibeStr = "🔥".repeat(outfit.vibeRating);
  const hashtags = [
    "#FitCheck",
    "#OOTD",
    "#ShopYourCloset",
    "#StyleInspo",
    "#OutfitIdeas",
  ];
  // Add occasion-specific hashtag
  const occasionTag = `#${outfit.occasion.replace(/\s+/g, "")}`;
  hashtags.push(occasionTag);

  return [
    `${outfit.name} — my AI-styled look for ${occasion} ${vibeStr}`,
    "",
    outfit.description,
    "",
    "Styled with FitCheck ✨",
    "",
    hashtags.join(" "),
  ].join("\n");
}

/** Trigger a download of the PNG data URL */
function downloadPng(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ShareMenu({
  isOpen,
  onClose,
  onExportPng,
  outfit,
}: ShareMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const isMobile = isMobileDevice();

  // Clear toast after 2s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const exportAndGetPng = useCallback(async (): Promise<string | null> => {
    if (isExporting) return null;
    setIsExporting(true);
    try {
      return await onExportPng();
    } catch (err) {
      console.error("Failed to export card:", err);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [onExportPng, isExporting]);

  const handleInstagram = useCallback(async () => {
    const dataUrl = await exportAndGetPng();
    if (!dataUrl) return;

    // Try Instagram Stories URL scheme
    if (isMobile) {
      // Instagram Stories requires a specific format: background image as sticker
      // We open Instagram and instruct the user
      const instagramUrl = "instagram-stories://share";
      const opened = window.open(instagramUrl, "_blank");

      if (!opened) {
        // Fallback: download the image with instructions
        downloadPng(
          dataUrl,
          `fitcheck-${outfit.name.toLowerCase().replace(/\s+/g, "-")}.png`,
        );
        setToast("📸 Image saved! Open Instagram and post it manually.");
      } else {
        setToast("📸 Opening Instagram Stories...");
      }
    } else {
      // Desktop: download
      downloadPng(
        dataUrl,
        `fitcheck-${outfit.name.toLowerCase().replace(/\s+/g, "-")}.png`,
      );
      setToast("📸 Image saved! Post to Instagram manually.");
    }

    onClose();
  }, [exportAndGetPng, isMobile, outfit.name, onClose]);

  const handleTikTok = useCallback(async () => {
    const dataUrl = await exportAndGetPng();
    if (!dataUrl) return;

    // Download the image and copy caption
    downloadPng(
      dataUrl,
      `fitcheck-${outfit.name.toLowerCase().replace(/\s+/g, "-")}.png`,
    );

    if (isMobile) {
      // Try to open TikTok
      const tiktokUrl = "tiktok://";
      const opened = window.open(tiktokUrl, "_blank");
      if (!opened) {
        setToast("🎵 Image saved & caption copied! Open TikTok to post.");
      } else {
        setToast("🎵 Opening TikTok... image saved!");
      }

      // Also copy caption for TikTok
      const caption = generateShareCaption(outfit);
      try {
        await navigator.clipboard.writeText(caption);
      } catch {
        // Clipboard may fail; the caption is short enough to remember
      }
    } else {
      setToast("🎵 Image saved! Post to TikTok manually.");
    }

    onClose();
  }, [exportAndGetPng, isMobile, outfit, onClose]);

  const handleDownload = useCallback(async () => {
    const dataUrl = await exportAndGetPng();
    if (!dataUrl) return;

    downloadPng(
      dataUrl,
      `fitcheck-${outfit.name.toLowerCase().replace(/\s+/g, "-")}.png`,
    );
    setToast("💾 Image saved to your device!");
    onClose();
  }, [exportAndGetPng, outfit.name, onClose]);

  const handleCopyCaption = useCallback(async () => {
    const caption = generateShareCaption(outfit);
    try {
      await navigator.clipboard.writeText(caption);
      setToast("📋 Caption copied to clipboard!");
    } catch {
      // Fallback: show the text for manual copy
      setToast("📋 Copy this: " + caption.slice(0, 50) + "...");
    }
    onClose();
  }, [outfit, onClose]);

  const handleNativeShare = useCallback(async () => {
    const dataUrl = await exportAndGetPng();
    if (!dataUrl || !navigator.share) {
      setToast("Sharing not available on this device.");
      return;
    }

    // Convert data URL to a Blob for sharing
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File(
        [blob],
        `fitcheck-${outfit.name.toLowerCase().replace(/\s+/g, "-")}.png`,
        { type: "image/png" },
      );

      await navigator.share({
        title: `FitCheck — ${outfit.name}`,
        text: generateShareCaption(outfit),
        files: [file],
      });
    } catch (err) {
      // User cancelled or sharing not supported with files
      if ((err as Error)?.name !== "AbortError") {
        // Fallback: share text only
        try {
          await navigator.share({
            title: `FitCheck — ${outfit.name}`,
            text: generateShareCaption(outfit),
          });
        } catch {
          // User cancelled or failed
        }
      }
    }
    onClose();
  }, [exportAndGetPng, outfit, onClose]);

  const handleOption = useCallback(
    (key: ShareOptionKey) => {
      switch (key) {
        case "instagram":
          handleInstagram();
          break;
        case "tiktok":
          handleTikTok();
          break;
        case "download":
          handleDownload();
          break;
        case "copy":
          handleCopyCaption();
          break;
        case "native":
          handleNativeShare();
          break;
      }
    },
    [handleInstagram, handleTikTok, handleDownload, handleCopyCaption, handleNativeShare],
  );

  // Filter options based on platform
  const visibleOptions = SHARE_OPTIONS.filter((opt) => {
    if (opt.mobileOnly && !isMobile) return false;
    if (opt.desktopOnly && isMobile) return false;
    // Only show native share if Web Share API is available
    if (opt.key === "native" && typeof navigator?.share !== "function") return false;
    return true;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="share-backdrop" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className={`share-sheet ${isOpen ? "share-sheet--open" : ""}`}>
        {/* Handle bar */}
        <div className="share-handle" />

        <div className="share-header">
          <h3 className="share-title">Share Outfit</h3>
          <p className="share-subtitle">{outfit.name}</p>
        </div>

        {/* Loading overlay */}
        {isExporting && (
          <div className="share-loading">
            <span className="generate-spinner" />
            <span>Preparing image...</span>
          </div>
        )}

        {/* Share options grid */}
        <div className="share-options">
          {visibleOptions.map((opt) => (
            <button
              key={opt.key}
              className="share-option"
              onClick={() => handleOption(opt.key)}
              disabled={isExporting}
            >
              <span className="share-option-icon">{opt.emoji}</span>
              <span className="share-option-label">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button className="share-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>

      {/* Toast */}
      {toast && <div className="share-toast">{toast}</div>}
    </>
  );
}

export { generateShareCaption };
