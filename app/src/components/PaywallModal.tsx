import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/00w28r9JDdoW76z1kAbMQ01";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const navigate = useNavigate();
  const [showCompleteLink, setShowCompleteLink] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Reset the "already paid" link when the modal opens fresh
  useEffect(() => {
    if (isOpen) setShowCompleteLink(false);
  }, [isOpen]);

  const handleUpgrade = useCallback(() => {
    window.open(STRIPE_PAYMENT_LINK, "_blank", "noopener noreferrer");
    setShowCompleteLink(true);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="paywall-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="paywall-modal">
        {/* Close button */}
        <button className="paywall-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Icon */}
        <div className="paywall-icon">✨</div>

        {/* Heading */}
        <h2 className="paywall-heading">Unlock Unlimited Styling</h2>

        {/* Benefits */}
        <ul className="paywall-benefits">
          <li>
            <span className="paywall-check">✓</span>
            <span>Unlimited outfit generations</span>
          </li>
          <li>
            <span className="paywall-check">✓</span>
            <span>Organize your entire closet</span>
          </li>
          <li>
            <span className="paywall-check">✓</span>
            <span>"Complete the look" shopping recommendations</span>
          </li>
          <li>
            <span className="paywall-check">✓</span>
            <span>Early access to new features</span>
          </li>
        </ul>

        {/* Price */}
        <p className="paywall-price">
          <span className="paywall-amount">$29.99</span>
          <span className="paywall-period">one-time</span>
        </p>

        {/* CTA */}
        <button
          className="paywall-cta"
          onClick={handleUpgrade}
        >
          Get Attired Premium — $29.99
        </button>

        {/* "Already paid" link — appears after they click the Stripe link */}
        {showCompleteLink && (
          <button
            className="paywall-complete-link"
            onClick={() => {
              onClose();
              navigate("/success");
            }}
          >
            Already paid? Complete your upgrade →
          </button>
        )}

        {/* Dismiss */}
        <button className="paywall-dismiss" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </>
  );
}
