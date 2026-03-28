import { useState } from "react";
import { generateFromNL } from "../services/api";

export default function NLInput({ onCode }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await generateFromNL(text);
      onCode(result.terraform_code);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe your infrastructure... e.g. 'I need 3 web servers, a MySQL database and an S3 bucket in us-east-1'"
        rows={3}
        style={{
          background: "#0D1628", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, color: "#E8EDF5", fontSize: 14, padding: 16,
          fontFamily: "inherit", resize: "vertical", outline: "none",
        }}
      />
      {error && <p style={{ color: "#FF6B6B", fontSize: 13, margin: 0 }}>{error}</p>}
      <button onClick={handleGenerate} disabled={loading || !text.trim()}
        style={{
          background: "#00F5C4", color: "#04070F", border: "none", borderRadius: 10,
          padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1, alignSelf: "flex-start",
        }}>
        {loading ? "Generating..." : "Generate Terraform"}
      </button>
    </div>
  );
}
