export default function CostTable({ resources, totalAws, totalAzure, totalGcp }) {

  const renderPrice = (price, isBest, color, providerKey, details) => {
    if (price === -1) {
      return (
        <div style={{ color: "#5A6A85", fontSize: 12, fontStyle: "italic" }}>
          Not Available
        </div>
      );
    }
    const serviceName = details?.[providerKey]?.service_name || "";
    return (
      <div>
        <div style={{ fontSize: 11, color: "#5A6A85", marginBottom: 3 }}>
          {serviceName}
        </div>
        <div style={{ color: isBest ? "#34A853" : color, fontWeight: 700, fontSize: 15 }}>
          ${price.toFixed(2)}
          {isBest && (
            <span style={{
              fontSize: 10,
              background: "rgba(52,168,83,0.15)",
              color: "#34A853",
              border: "1px solid rgba(52,168,83,0.3)",
              borderRadius: 6,
              padding: "2px 7px",
              marginLeft: 7,
              fontWeight: 600
            }}>
              BEST
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "#080E1C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 24px", background: "#0D1628", fontSize: 12, fontWeight: 600, color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        <div>Resource</div>
        <div style={{ color: "#FF9900" }}>⬡ AWS</div>
        <div style={{ color: "#0089D6" }}>⬡ Azure</div>
        <div style={{ color: "#34A853" }}>⬡ GCP</div>
      </div>

      {/* Rows */}
      {resources.map((r, i) => {
        const bp = r.best_provider || "";
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 14 }}>
            <div>
              <div style={{ fontWeight: 600, color: "#E8EDF5" }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "#5A6A85", marginTop: 3 }}>{r.resource_type}</div>
            </div>
            {renderPrice(r.aws, bp === "AWS", "#FF9900", "AWS", r.provider_details)}
            {renderPrice(r.azure, bp === "Azure", "#0089D6", "Azure", r.provider_details)}
            {renderPrice(r.gcp, bp === "GCP", "#34A853", "GCP", r.provider_details)}
          </div>
        );
      })}

      {/* Totals row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 24px", background: "#0D1628", fontWeight: 700, fontSize: 15, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ color: "#E8EDF5" }}>Total / month</div>
        <div style={{ color: "#FF9900" }}>${Math.max(0, totalAws).toFixed(2)}</div>
        <div style={{ color: "#0089D6" }}>${Math.max(0, totalAzure).toFixed(2)}</div>
        <div style={{ color: "#34A853" }}>${Math.max(0, totalGcp).toFixed(2)}</div>
      </div>

    </div>
  );
}