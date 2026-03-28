export default function SpotScore({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div style={{ background: "#080E1C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Spot instance survival score</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recommendations.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0D1628", borderRadius: 10, padding: "12px 16px" }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{r.resource}</span>
              <span style={{ color: "#5A6A85", fontSize: 12, marginLeft: 8 }}>{r.instance_type}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 12, color: "#5A6A85" }}>{r.interruption_rate}% interruption</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#00F5C4" }}>Save {r.savings_percent}%</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: r.safe ? "rgba(52,168,83,0.12)" : "rgba(255,107,107,0.12)",
                color: r.safe ? "#34A853" : "#FF6B6B",
                border: `1px solid ${r.safe ? "rgba(52,168,83,0.3)" : "rgba(255,107,107,0.3)"}`,
              }}>
                {r.safe ? "SAFE" : "RISKY"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
