import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DropZone from "../components/DropZone";
import NLInput from "../components/NLInput";
import { estimateCost } from "../services/api";

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("file");
  const navigate = useNavigate();

  const handleResult = (result) => {
    navigate("/dashboard", { state: { result } });
  };

  const handleEstimate = async () => {
    if (!code.trim()) {
      setError("Please enter Terraform code first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await estimateCost(code);
      navigate("/dashboard", { state: { result, code } });
    } catch (e) {
      setError(e.message || "Estimation failed — make sure backend is running");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "60px auto", padding: "0 24px" }}>

      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,245,196,0.08)", border: "1px solid rgba(0,245,196,0.2)", borderRadius: 100, padding: "6px 16px", fontSize: 12, color: "#00F5C4", marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, background: "#00F5C4", borderRadius: "50%", display: "inline-block" }}></span>
          Multi-cloud cost intelligence
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, margin: "0 0 16px", color: "#E8EDF5" }}>
          Know your cloud cost<br />
          <span style={{ color: "#00F5C4" }}>before liftoff.</span>
        </h1>
        <p style={{ color: "#5A6A85", fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
          Drop your Terraform file and instantly compare costs on AWS, Azure, and GCP.
        </p>
      </div>

      {/* Tab selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { key: "file",     label: "Upload .tf file" },
          { key: "paste",    label: "Paste code" },
          { key: "describe", label: "Describe in English" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "1px solid",
              borderColor: tab === t.key ? "#00F5C4" : "rgba(255,255,255,0.1)",
              background: tab === t.key ? "rgba(0,245,196,0.08)" : "transparent",
              color: tab === t.key ? "#00F5C4" : "#5A6A85",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "file" && (
        <DropZone onResult={handleResult} onLoading={setLoading} />
      )}

      {tab === "paste" && (
        <div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={'resource "aws_instance" "web" {\n  instance_type = "t3.medium"\n  count = 2\n}\n\nresource "aws_db_instance" "db" {\n  instance_class = "db.t3.micro"\n  allocated_storage = 20\n}'}
            rows={12}
            style={{
              width: "100%", background: "#0D1628",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, color: "#E8EDF5",
              fontSize: 13, padding: 16,
              fontFamily: "monospace", resize: "vertical",
              outline: "none", boxSizing: "border-box",
            }}
          />
          {error && <p style={{ color: "#FF6B6B", fontSize: 13, margin: "8px 0" }}>{error}</p>}
          <button onClick={handleEstimate} disabled={loading}
            style={{
              marginTop: 12,
              background: "#00F5C4", color: "#04070F",
              border: "none", borderRadius: 10,
              padding: "14px 36px", fontWeight: 700,
              fontSize: 15, cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? "Estimating..." : "Estimate cost on all 3 clouds"}
          </button>
        </div>
      )}

      {tab === "describe" && (
        <NLInput onCode={(c) => { setCode(c); setTab("paste"); }} />
      )}

      {loading && (
        <div style={{ textAlign: "center", marginTop: 24, color: "#00F5C4", fontSize: 14 }}>
          Fetching live prices from AWS, Azure and GCP...
        </div>
      )}
    </div>
  );
}
