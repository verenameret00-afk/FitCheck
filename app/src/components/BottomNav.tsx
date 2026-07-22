import { NavLink } from "react-router-dom";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} end>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="nav-label">Home</span>
      </NavLink>
      <NavLink to="/closet" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span className="nav-label">Closet</span>
      </NavLink>
      <NavLink to="/outfits" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
        <span className="nav-label">Outfits</span>
      </NavLink>
      <NavLink to="/styletwin" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <span className="nav-icon nav-icon-emoji">👯</span>
        <span className="nav-label">Twin</span>
      </NavLink>
      <NavLink to="/community" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <span className="nav-icon nav-icon-emoji">💬</span>
        <span className="nav-label">Comm</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="nav-label">Profile</span>
      </NavLink>
    </nav>
  );
}
