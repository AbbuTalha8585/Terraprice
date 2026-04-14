import { useNavigate, useLocation } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;


  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(4,7,15,0.8)", backdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, background: "#00F5C4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#04070F" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
          Terra<span style={{ color: "#00F5C4" }}>Price</span>
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "Cost Estimator", path: "/" },
          { label: "Dashboard", path: "/dashboard" },
        ].map(link => (
          <button key={link.path} onClick={() => navigate(link.path)}
            style={{
              padding: "7px 16px", borderRadius: 8, border: "1px solid",
              borderColor: isActive(link.path) ? "#00F5C4" : "rgba(255,255,255,0.08)",
              background: isActive(link.path) ? "rgba(0,245,196,0.08)" : "transparent",
              color: isActive(link.path) ? "#00F5C4" : "#5A6A85",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.15s",
            }}>
            {link.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 24, fontSize: 14, color: "#5A6A85" }}>
        <span style={{ fontWeight: 600, color: "#fff" }}>Dashboard</span>
      </div>

      <div style={{ display: "flex", gap: 24, fontSize: 14, color: "#5A6A85" }}>
        <span>AWS · Azure · GCP</span>
      </div>
    </nav>
  );
}
