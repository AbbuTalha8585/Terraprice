import { useState } from "react";

export default function DRMode({ drCost, onToggle, enabled }) {
  const [drType, setDrType] = useState("warm");

  return (
    <div style={{ background: "#080E1C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Disaster recovery cost</h3>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <span style={{ fontSize: 13, color: "#5A6A85" }}>Enable DR</span>
          <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked, drType)} />
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["hot", "warm", "cold"].map((t) => (
          <button key={t} onClick={() => { setDrType(t); if (enabled) onToggle(true, t); }}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid",
              borderColor: drType === t ? "#00F5C4" : "rgba(255,255,255,0.1)",
              background: drType === t ? "rgba(0,245,196,0.08)" : "transparent",
              color: drType === t ? "#00F5C4" : "#5A6A85",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {drCost && enabled && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "AWS with DR", value: drCost.aws_with_dr, extra: drCost.aws_dr_extra, color: "#FF9900" },
            { label: "Azure with DR", value: drCost.azure_with_dr, extra: drCost.azure_dr_extra, color: "#0089D6" },
            { label: "GCP with DR", value: drCost.gcp_with_dr, extra: drCost.gcp_dr_extra, color: "#34A853" },
          ].map((p, i) => (
            <div key={i} style={{ background: "#0D1628", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#5A6A85", marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: p.color }}>${p.value?.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: "#FF6B6B", marginTop: 2 }}>+${p.extra?.toFixed(2)}/mo</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
