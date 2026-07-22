import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page home-page">
      <div className="hero">
        <div className="logo-mark">◆</div>
        <h1 className="app-name">Attired</h1>
        <p className="tagline">build looks you love</p>
        <p className="subtitle">
          AI-powered outfits from clothes you already own
        </p>
        <button
          className="cta-button"
          onClick={() => navigate("/closet")}
        >
          Upload Your Closet
        </button>
      </div>

      <div className="features">
        <div className="feature-card">
          <span className="feature-icon">📸</span>
          <h3>Snap Your Closet</h3>
          <p>Photograph what you own — we'll catalog it all</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">✨</span>
          <h3>Get Styled</h3>
          <p>AI creates outfit combos for any occasion</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">💅</span>
          <h3>Share Your Look</h3>
          <p>Post your lookbook cards to socials in one tap</p>
        </div>
      </div>
    </div>
  );
}
