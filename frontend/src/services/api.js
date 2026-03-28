const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function estimateCost(terraformCode, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}/estimate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        terraform_code: terraformCode,
        region: options.region || "us-east-1",
        monthly_requests: options.monthlyRequests || 100000,
        growth_rate: options.growthRate || 0.1,
        enable_dr: options.enableDr || false,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Estimation failed");
    }
    return res.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function uploadTfFile(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/estimate/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "File upload failed");
    }
    return res.json();
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
}

export async function generateFromNL(description) {
  try {
    const res = await fetch(`${BASE_URL}/generate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ description }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Generation failed");
    }
    return res.json();
  } catch (error) {
    console.error("NL Error:", error);
    throw error;
  }
}
