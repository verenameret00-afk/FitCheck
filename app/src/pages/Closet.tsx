import { useRef } from "react";
import { useCloset } from "../contexts/ClosetContext";

const OCCASIONS = [
  "Date Night",
  "Job Interview",
  "Brunch",
  "Casual Friday",
  "Night Out",
  "Wedding Guest",
];

const CATEGORY_EMOJI: Record<string, string> = {
  top: "👕",
  bottom: "👖",
  dress: "👗",
  outerwear: "🧥",
  shoes: "👟",
  accessory: "💍",
};

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    black: "#1a1a1a",
    white: "#f5f5f5",
    navy: "#1b2a4a",
    blue: "#3b82f6",
    red: "#ef4444",
    pink: "#ec4899",
    green: "#22c55e",
    yellow: "#eab308",
    orange: "#f97316",
    purple: "#a855f7",
    brown: "#92400e",
    gray: "#6b7280",
    grey: "#6b7280",
    beige: "#d4c5a9",
    tan: "#d2b48c",
    cream: "#fdf6e3",
    burgundy: "#800020",
    maroon: "#800000",
    olive: "#808000",
    teal: "#008080",
    coral: "#ff6f61",
    gold: "#ffd700",
    silver: "#c0c0c0",
  };
  return map[color.toLowerCase()] || "#888";
}

export default function Closet() {
  const { items, addItems, removeItem, selectedOccasion, setSelectedOccasion } =
    useCloset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addItems(Array.from(files));
      e.target.value = "";
    }
  };

  const handleOccasionSelect = (occasion: string) => {
    const next = selectedOccasion === occasion ? null : occasion;
    setSelectedOccasion(next);
    console.log("Occasion selected:", next || "none");
  };

  return (
    <div className="page closet-page">
      <header className="page-header">
        <h2>My Closet</h2>
        <p>Your wardrobe, digitized</p>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-label="Upload clothing photos"
      />

      {items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👗</span>
          <h3>Your closet is empty</h3>
          <p>Start by uploading your clothes!</p>
          <button className="cta-button" onClick={handleUploadClick}>
            + Add Clothes
          </button>
        </div>
      ) : (
        <>
          <div className="upload-bar">
            <button className="upload-btn" onClick={handleUploadClick}>
              <span className="upload-icon">+</span>
              <span>Add More</span>
            </button>
            <span className="item-count">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="closet-grid">
            {items.map((item) => (
              <div key={item.id} className="closet-card">
                <img src={item.dataUrl} alt={item.name} />
                <button
                  className="closet-card-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                >
                  ✕
                </button>

                {/* Analysis overlay */}
                {item.isAnalyzing && (
                  <div className="closet-card-analysis analyzing">
                    <span className="analyzing-spinner" />
                    <span>Analyzing...</span>
                  </div>
                )}

                {!item.isAnalyzing && item.analysis && (
                  <div className="closet-card-analysis analyzed">
                    <div className="analysis-header">
                      <span className="analysis-emoji">
                        {CATEGORY_EMOJI[item.analysis.category] || "👔"}
                      </span>
                      <span className="analysis-label">
                        {item.analysis.subcategory !== "unknown"
                          ? capitalize(item.analysis.subcategory)
                          : capitalize(item.analysis.category)}
                        {" · "}
                        {capitalize(item.analysis.color)}
                      </span>
                      <span
                        className="analysis-swatch"
                        style={{
                          backgroundColor: colorToHex(item.analysis.color),
                        }}
                      />
                    </div>
                    <div className="analysis-tags">
                      {item.analysis.styleTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="analysis-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

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
                >
                  {occasion}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
