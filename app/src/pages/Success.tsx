import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { unlockPremium, isPremium } from "../lib/usage";

type VerifyState = "form" | "success";

export default function Success() {
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>(
    isPremium() ? "success" : "form",
  );
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const isValid = amount.trim() === "29.99";

  const handleUnlock = useCallback(() => {
    if (!isValid) {
      setError("Please enter the exact amount: 29.99");
      return;
    }
    unlockPremium();
    setError("");
    setState("success");
  }, [isValid]);

  return (
    <div className="page success-page">
      <div className="success-container">
        {state === "form" && (
          <div className="success-state">
            <div className="success-badge">✨</div>
            <h2 className="success-heading">Complete Your Upgrade</h2>
            <p className="success-desc">
              Already paid on Stripe? Enter the amount below to unlock your
              premium features.
            </p>

            <div className="success-form">
              <label className="success-label" htmlFor="success-amount">
                Confirm the amount you paid
              </label>
              <div className="success-input-wrap">
                <span className="success-input-dollar">$</span>
                <input
                  id="success-amount"
                  className="success-input"
                  type="text"
                  inputMode="decimal"
                  placeholder="29.99"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValid) handleUnlock();
                  }}
                  autoFocus
                />
              </div>
              {error && <p className="success-error">{error}</p>}
              <button
                className="success-cta"
                disabled={!isValid}
                onClick={handleUnlock}
              >
                Unlock Premium
              </button>
            </div>

            <p className="success-help">
              Haven't paid yet?{" "}
              <a
                href="https://buy.stripe.com/00w28r9JDdoW76z1kAbMQ01"
                className="success-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Complete your purchase →
              </a>
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="success-state success-state--done">
            <div className="success-badge">🎉</div>
            <h2 className="success-heading">You're Premium!</h2>
            <p className="success-desc">
              Unlimited outfit generations, full Community access, Style Twin
              sharing, closet organization, and shopping recommendations are now
              unlocked.
            </p>
            <div className="success-features">
              <span className="success-feature">✨ Unlimited outfits</span>
              <span className="success-feature">💬 Full Community</span>
              <span className="success-feature">👯 Send to Twins</span>
              <span className="success-feature">👗 Closet tools</span>
              <span className="success-feature">🛍️ Shopping recs</span>
            </div>
            <button
              className="success-cta"
              onClick={() => navigate("/outfits")}
            >
              Start Styling →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
