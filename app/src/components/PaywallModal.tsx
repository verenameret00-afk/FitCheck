import { useEffect, useState, useCallback } from "react";

const STRIPE_FALLBACK_LINK = "https://buy.stripe.com/00w28r9JDdoW76z1kAbMQ01";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

async function createCheckoutSession(): Promise<string> {
  try {
    const resp = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = (await resp.json()) as { url?: string; fallback?: boolean };

    if (data.url) {
      return data.url;
    }

    // Fallback: API not configured — use the hosted payment link
    console.warn("Stripe checkout API not available, using fallback link");
    return STRIPE_FALLBACK_LINK;
  } catch {
    console.warn("Stripe checkout API unreachable, using fallback link");
    return STRIPE_FALLBACK_LINK;
  }
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleUpgrade = useCallback(async () => {
    setLoading(true);
    try {
      const url = await createCheckoutSession();
      window.location.href = url;
    } catch {
      // Fallback — open the static link in a new tab
      window.open(STRIPE_FALLBACK_LINK, "_blank", "noopener noreferrer");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
        >
          {loading ? "Preparing checkout…" : "Get FitCheck Premium — $29.99"}
        </button>

        {/* Dismiss */}
        <button className="paywall-dismiss" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </>
  );
}
