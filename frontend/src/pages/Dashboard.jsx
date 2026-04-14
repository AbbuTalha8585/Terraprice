import { useLocation, useNavigate } from "react-router-dom";
import CostTable from "../components/CostTable";
import ForecastChart from "../components/ForecastChart";
import SmellDetector from "../components/SmellDetector";
import SpotScore from "../components/SpotScore";
import DRMode from "../components/DRMode";
import TopologyView from "./TopologyView";

export default function Dashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.result) {
    navigate("/");
    return null;
  }

  const { result, code } = state;

  const providerColors = {
    AWS: "#FF9900",
    Azure: "#0089D6",
    GCP: "#34A853",
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>

      <button onClick={() => navigate("/")}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#5A6A85", borderRadius: 8,
          padding: "8px 16px", fontSize: 13,
          cursor: "pointer", marginBottom: 32,
        }}>
        ← New estimate
      </button>

      {/* Cheapest provider banner */}
      <div style={{
        background: "rgba(0,245,196,0.06)",
        border: "1px solid rgba(0,245,196,0.2)",
        borderRadius: 12, padding: "14px 20px",
        marginBottom: 24, fontSize: 15,
        color: "#00F5C4", fontWeight: 600,
      }}>
        Cheapest provider: {result.cheapest_provider} — ${
          result.cheapest_provider === "AWS" ? result.total_aws.toFixed(2) :
          result.cheapest_provider === "Azure" ? result.total_azure.toFixed(2) :
          result.total_gcp.toFixed(2)
        }/month
      </div>

      {/* Total cost cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "AWS total",   value: result.total_aws,   color: "#FF9900" },
          { label: "Azure total", value: result.total_azure, color: "#0089D6" },
          { label: "GCP total",   value: result.total_gcp,   color: "#34A853" },
        ].map((c, i) => (
          <div key={i} style={{
            background: "#080E1C",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: 24, textAlign: "center",
          }}>
            <div style={{ fontSize: 12, color: "#5A6A85", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {c.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: c.color }}>
              ${c.value.toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: "#5A6A85", marginTop: 4 }}>per month</div>
          </div>
        ))}
      </div>

      {/* All feature sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {code && <TopologyView tfCode={code} />}
        <CostTable
          resources={result.resources}
          totalAws={result.total_aws}
          totalAzure={result.total_azure}
          totalGcp={result.total_gcp}
          cheapest={result.cheapest_provider}
        />
        <ForecastChart forecast={result.forecast} />
        <SmellDetector issues={result.smell_issues} />
        <SpotScore recommendations={result.spot_recommendations} />
        <DRMode
          drCost={result.dr_cost}
          enabled={!!result.dr_cost}
          onToggle={() => {}}
        />
      </div>
    </div>
  );
}
