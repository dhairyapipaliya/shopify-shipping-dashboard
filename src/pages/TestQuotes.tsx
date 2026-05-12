import { FormEvent, useState } from "react";
import { apiFetch } from "../api/client.js";
import { Layout } from "../components/Layout.js";

type QuoteResult = {
  ranked: Array<{
    provider: string;
    serviceName: string;
    shippingCost: number;
    codCharges: number;
    etaDays: number;
    supportsCod: boolean;
  }>;
  cheapest: unknown;
  savingsAmount: number;
};

const defaultForm = {
  destinationPincode: "",
  weightGrams: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  paymentMode: "PREPAID",
  orderValue: "0"
};

export function TestQuotesPage() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ result: QuoteResult }>("/api/admin/test-quotes", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setResult(data.result);
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div className="field">
      <label className="label" htmlFor={key}>{label}</label>
      <input
        id={key}
        className="input"
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required
      />
    </div>
  );

  return (
    <Layout eyebrow="Admin Tools" title="Test Quotes">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem", alignItems: "start" }}>
        <section className="card">
          <h2 style={{ marginBottom: "1rem" }}>Rate Calculator</h2>
          <form onSubmit={handleSubmit}>
            {field("destinationPincode", "Destination Pincode")}
            {field("weightGrams", "Weight (grams)", "number")}
            {field("lengthCm", "Length (cm)", "number")}
            {field("widthCm", "Width (cm)", "number")}
            {field("heightCm", "Height (cm)", "number")}
            <div className="field">
              <label className="label" htmlFor="paymentMode">Payment Mode</label>
              <select
                id="paymentMode"
                className="input"
                value={form.paymentMode}
                onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}
              >
                <option value="PREPAID">Prepaid</option>
                <option value="COD">COD</option>
              </select>
            </div>
            {field("orderValue", "Order Value (₹)", "number")}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Fetching…" : "Get Quotes"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2 style={{ marginBottom: "1rem" }}>Results</h2>
          {!result && <p className="muted">Submit the form to see quotes.</p>}
          {result && (
            <>
              {result.savingsAmount > 0 && (
                <p className="muted small" style={{ marginBottom: "1rem" }}>
                  Potential savings vs most expensive: <strong>₹{result.savingsAmount.toFixed(2)}</strong>
                </p>
              )}
              <div className="stack-list">
                {result.ranked.map((q, i) => (
                  <div key={i} className="stack-row">
                    <div className="row-stack">
                      <strong>{q.provider} – {q.serviceName}</strong>
                      <span className="muted small">ETA: {q.etaDays} days · {q.supportsCod ? "COD" : "Prepaid only"}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="badge badge-blue">₹{q.shippingCost.toFixed(2)}</span>
                      {q.codCharges > 0 && (
                        <span className="badge badge-amber" style={{ marginLeft: "0.25rem" }}>+₹{q.codCharges.toFixed(2)} COD</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}
