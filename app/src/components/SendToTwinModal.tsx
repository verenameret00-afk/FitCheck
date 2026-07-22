import { useState, useCallback, useEffect } from "react";
import { DEMO_TWIN_MATCHES, type TwinMatch } from "../lib/communityData";

export interface SendToTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfitName: string;
}

export default function SendToTwinModal({ isOpen, onClose, outfitName }: SendToTwinModalProps) {
  const [step, setStep] = useState<"select" | "message" | "sent">("select");
  const [selectedTwin, setSelectedTwin] = useState<TwinMatch | null>(null);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep("select");
      setSelectedTwin(null);
      setMessage("");
    }
  }, [isOpen]);

  // Clear toast after 2.5s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleSelectTwin = useCallback((twin: TwinMatch) => {
    setSelectedTwin(twin);
    setMessage(`Hey ${twin.name}! Check out this look I put together 🍃\n\n"${outfitName}" — styled with Attired ✨`);
    setStep("message");
  }, [outfitName]);

  const handleSend = useCallback(() => {
    if (!selectedTwin) return;
    setStep("sent");
    setToast(`Look sent to ${selectedTwin.name}! 💌`);
    setTimeout(() => {
      onClose();
    }, 1500);
  }, [selectedTwin, onClose]);

  const handleBack = useCallback(() => {
    setStep("select");
    setSelectedTwin(null);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="sendtwin-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className={`sendtwin-modal ${isOpen ? "sendtwin-modal--open" : ""}`}>
        <div className="sendtwin-handle" />

        {/* Header */}
        <div className="sendtwin-header">
          <h3 className="sendtwin-title">Send to Style Twin 👯</h3>
          {step === "select" && (
            <p className="sendtwin-subtitle">Choose who to share this look with</p>
          )}
          {step === "message" && selectedTwin && (
            <p className="sendtwin-subtitle">
              Sending to <strong>{selectedTwin.name}</strong>
            </p>
          )}
          {step === "sent" && (
            <p className="sendtwin-subtitle">Message sent! ✨</p>
          )}
        </div>

        {/* Step indicator */}
        <div className="sendtwin-steps">
          <span className={`sendtwin-step ${step === "select" ? "sendtwin-step--active" : ""}`}>1</span>
          <span className="sendtwin-step-line" />
          <span className={`sendtwin-step ${step === "message" ? "sendtwin-step--active" : ""}`}>2</span>
          <span className="sendtwin-step-line" />
          <span className={`sendtwin-step ${step === "sent" ? "sendtwin-step--active" : ""}`}>3</span>
        </div>

        {/* Step 1: Select Twin */}
        {step === "select" && (
          <div className="sendtwin-twin-list">
            {DEMO_TWIN_MATCHES.map((twin) => (
              <button
                key={twin.id}
                className="sendtwin-twin-card"
                onClick={() => handleSelectTwin(twin)}
              >
                <div className="sendtwin-twin-avatar-wrap">
                  <span className="sendtwin-twin-avatar">{twin.avatarEmoji}</span>
                  <span
                    className="sendtwin-twin-color"
                    style={{ backgroundColor: twin.topColor }}
                  />
                </div>
                <div className="sendtwin-twin-info">
                  <span className="sendtwin-twin-name">{twin.name}</span>
                  <span className="sendtwin-twin-persona">
                    {twin.persona.emoji} {twin.persona.label}
                  </span>
                </div>
                <span className="sendtwin-twin-pct">{twin.matchPercentage}%</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Compose Message */}
        {step === "message" && selectedTwin && (
          <div className="sendtwin-compose">
            <div className="sendtwin-compose-preview">
              <span className="sendtwin-compose-avatar">{selectedTwin.avatarEmoji}</span>
              <span className="sendtwin-compose-name">To: {selectedTwin.name}</span>
            </div>
            <textarea
              className="sendtwin-compose-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Write a message..."
            />
            <div className="sendtwin-compose-actions">
              <button className="sendtwin-btn sendtwin-btn--secondary" onClick={handleBack}>
                ← Back
              </button>
              <button className="sendtwin-btn sendtwin-btn--primary" onClick={handleSend}>
                Send 💌
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sent confirmation */}
        {step === "sent" && (
          <div className="sendtwin-sent">
            <span className="sendtwin-sent-emoji">💌</span>
            <p className="sendtwin-sent-text">
              Look sent to <strong>{selectedTwin?.name}</strong>!
            </p>
            <p className="sendtwin-sent-hint">They'll see it in their feed soon ✨</p>
          </div>
        )}

        {/* Close button (bottom) */}
        {step !== "sent" && (
          <button className="sendtwin-close" onClick={onClose}>
            Cancel
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="share-toast">{toast}</div>}
    </>
  );
}
