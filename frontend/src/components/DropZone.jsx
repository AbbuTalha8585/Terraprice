import { useState, useRef } from "react";
import { uploadTfFile, estimateCost } from "../services/api";

export default function DropZone({ onResult, onLoading }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = async (file) => {
    if (!file.name.endsWith(".tf")) {
      setError("Only .tf files are supported");
      return;
    }
    setFileName(file.name);
    setError("");
    onLoading(true);
    try {
      // Read file as text and send to estimate endpoint
      const text = await file.text();
      const result = await estimateCost(text);
      onResult(result, text);
    } catch (e) {
      setError(e.message || "Failed to estimate cost");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? "#00F5C4" : "rgba(0,245,196,0.3)"}`,
          borderRadius: "16px",
          padding: "48px 32px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "rgba(0,245,196,0.04)" : "transparent",
          transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>⬆</div>
        <p style={{ fontWeight: 600, fontSize: 18, marginBottom: 6, color: "#E8EDF5" }}>
          {fileName || "Drop your Terraform file here"}
        </p>
        <p style={{ color: "#5A6A85", fontSize: 14 }}>
          Click to browse or drag and drop your .tf file
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".tf"
          style={{ display: "none" }}
          onChange={handleFileInput}
        />
      </div>
      {error && (
        <p style={{ color: "#FF6B6B", fontSize: 13, marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
}
