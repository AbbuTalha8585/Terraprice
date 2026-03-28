import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ForecastChart({ forecast }) {
  return (
    <div style={{ background: "#080E1C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>12-month cost forecast</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={forecast}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" stroke="#5A6A85" tick={{ fontSize: 12 }} />
          <YAxis stroke="#5A6A85" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{ background: "#0D1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            formatter={(value) => [`$${value.toFixed(2)}`, ""]}
          />
          <Legend />
          <Line type="monotone" dataKey="aws" stroke="#FF9900" strokeWidth={2} dot={false} name="AWS" />
          <Line type="monotone" dataKey="azure" stroke="#0089D6" strokeWidth={2} dot={false} name="Azure" />
          <Line type="monotone" dataKey="gcp" stroke="#34A853" strokeWidth={2} dot={false} name="GCP" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
