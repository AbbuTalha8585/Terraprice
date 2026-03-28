export default function CostTable({ resources, totalAws, totalAzure, totalGcp, cheapest }) {
  const best = (aws, azure, gcp) => {
    const values = [aws, azure, gcp].filter(v => v >= 0);
    if (values.length === 0) return { aws: false, azure: false, gcp: false };
    const min = Math.min(...values);
    return { 
      aws: aws === min && aws >= 0, 
      azure: azure === min && azure >= 0, 
      gcp: gcp === min && gcp >= 0 
    };
  };

  const renderPrice = (price, isBest, color, label) => {
    if (price === -1) {
      return (
        <div style={{ color: "#5A6A85", fontSize: 12, fontStyle: "italic" }}>
          Not Available
        </div>
      );
    }
    return (
      <div style={{ color: isBest ? "#34A853" : color, fontWeight: 600 }}>
        ${price.toFixed(2)}
        {isBest && <span style={{ fontSize: 10, background: "rgba(52,168,83,0.12)", color: "#34A853", border: "1px solid rgba(52,168,83,0.25)", borderRadius: 6, padding: "1px 6px", marginLeft: 6 }}>BEST</span>}
      </div>
    );
  };

  return (
    <div style={{ background: "#080E1C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 24px", background: "#0D1628", fontSize: 12, fontWeight: 600, color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        <div>Resource</div>
        <div style={{ color: "#FF9900" }}>AWS</div>
        <div style={{ color: "#0089D6" }}>Azure</div>
        <div style={{ color: "#34A853" }}>GCP</div>
      </div>

      {resources.map((r, i) => {
        const b = best(r.aws, r.azure, r.gcp);
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 14 }}>
            <div>
              <div style={{ fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "#5A6A85", marginTop: 2 }}>{r.resource_type}</div>
            </div>
            {renderPrice(r.aws, b.aws, "#FF9900", "AWS")}
            {renderPrice(r.azure, b.azure, "#0089D6", "Azure")}
            {renderPrice(r.gcp, b.gcp, "#34A853", "GCP")}
          </div>
        );
      })}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 24px", background: "#0D1628", fontWeight: 700, fontSize: 15, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div>Total / month</div>
        <div style={{ color: "#FF9900" }}>${Math.max(0, totalAws).toFixed(2)}</div>
        <div style={{ color: "#0089D6" }}>${Math.max(0, totalAzure).toFixed(2)}</div>
        <div style={{ color: "#34A853" }}>${Math.max(0, totalGcp).toFixed(2)}</div>
      </div>
    </div>
  );
}
