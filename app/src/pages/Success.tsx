import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { unlockPremium } from "../lib/usage";

type VerifyState = "loading" | "success" | "failure";

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const sessionId = searchParams.get("session_id") || "";

  const verifyPayment = useCallback(async () => {
    if (!sessionId) {
      setState("failure");
      setErrorMessage("No session ID found. Please contact support.");
      return;
    }

    try {
      const resp = await fetch(`/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`);
      const data = (await resp.json()) as { paid?: boolean; error?: string };

      if (data.paid) {
        unlockPremium();
        setState("success");
      } else {
        setState("failure");
        setErrorMessage(data.error || "Payment could not be verified. Please contact support.");
      }
    } catch {
      setState("failure");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  }, [sessionId]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="page success-page">
      <div className="success-container">
        {state === "loading" && (
          <div className="success-state">
            <div className="success-spinner" />
            <h2 className="success-heading">Verifying your payment…</h2>
            <p className="success-desc">
              One moment while we confirm your purchase.
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="success-state success-state--done">
            <div className="success-badge">🎉</div>
            <h2 className="success-heading">You're Premium!</h2>
            <p className="success-desc">
              Unlimited outfit generations, closet organization, and shopping
              recommendations are now unlocked.
            </p>
            <div className="success-features">
              <span className="success-feature">✨ Unlimited outfits</span>
              <span className="success-feature">👗 Full closet tools</span>
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

        {state === "failure" && (
          <div className="success-state success-state--fail">
            <div className="success-badge success-badge--fail">😕</div>
            <h2 className="success-heading">Verification Failed</h2>
            <p className="success-desc">{errorMessage}</p>
            <div className="success-actions">
              <button
                className="success-cta success-cta--secondary"
                onClick={verifyPayment}
              >
                Try Again
              </button>
              <button
                className="success-cta"
                onClick={() => navigate("/profile")}
              >
                Back to Profile
              </button>
            </div>
            <p className="success-help">
              If you completed payment and still see this, email us at{" "}
              <a href="mailto:help@fitcheck.app" className="success-link">
                help@fitcheck.app
              </a>{" "}
              with your receipt.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
