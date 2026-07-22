import { useEffect } from "react";

const STRIPE_LINK = "https://buy.stripe.com/cNifZh6xr5Wu62v3sIbMQ00";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

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
          <span className="paywall-amount">$9.99</span>
          <span className="paywall-period">/month</span>
        </p>

        {/* CTA */}
        <a
          href={STRIPE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="paywall-cta"
        >
          Get FitCheck Premium — $9.99/mo
        </a>

        {/* Dismiss */}
        <button className="paywall-dismiss" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </>
  );
}
