export default function SmellDetector({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div style={{ background: "#080E1C", border: "1px solid rgba(52,168,83,0.2)", borderRadius: 16, padding: 24 }}>
        <p style={{ color: "#34A853", fontWeight: 600, margin: 0 }}>No expensive patterns found — your config looks good!</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#080E1C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#FF6B6B" }}>
        Architecture issues found ({issues.length})
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {issues.map((issue, i) => (
          <div key={i} style={{ background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.15)", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{issue.resource}</span>
              <span style={{ color: "#34A853", fontWeight: 700, fontSize: 14 }}>Save ${issue.savings.toFixed(2)}/mo</span>
            </div>
            <p style={{ color: "#FF6B6B", fontSize: 13, margin: "0 0 6px" }}>{issue.issue}</p>
            <p style={{ color: "#5A6A85", fontSize: 13, margin: 0 }}>Fix: {issue.fix}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
