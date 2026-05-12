import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDispatch, selectDispatchRate, type DispatchResponse } from "../api/dispatch.js";
import { Layout } from "../components/Layout.js";

export function DispatchPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<DispatchResponse | null>(null);
  const [selectedRateId, setSelectedRateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    getDispatch(orderId)
      .then(setData)
      .catch((err) => setError(String(err.message)))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleSelect = async () => {
    if (!orderId || !selectedRateId) return;
    setSaving(true);
    try {
      await selectDispatchRate(orderId, selectedRateId);
      navigate("/orders?status=pickupsAndManifests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select rate");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout eyebrow="Dispatch" title="Select Courier"><p className="muted">Loading…</p></Layout>;
  if (error) return <Layout eyebrow="Dispatch" title="Select Courier"><p className="muted">{error}</p></Layout>;
  if (!data) return null;

  return (
    <Layout eyebrow="Dispatch" title="Select Courier">
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <p className="muted small">Order: <strong>{orderId}</strong></p>
        <p className="muted small">Current Provider: <span className="badge badge-slate">{data.selectedProvider || "—"}</span></p>
      </div>

      {data.rateGroups.map((group) => (
        <section key={group.provider} className="card" style={{ marginBottom: "1rem" }}>
          <div className="section-header">
            <h2>{group.provider}</h2>
          </div>
          <div className="stack-list">
            {group.options.map((rate) => (
              <label key={rate.option_id} className="stack-row interactive-card" style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="rate"
                  value={rate.option_id}
                  checked={selectedRateId === rate.option_id}
                  onChange={() => setSelectedRateId(rate.option_id)}
                  style={{ marginRight: "0.75rem" }}
                />
                <div className="row-stack">
                  <strong>{rate.label}</strong>
                  <span className="muted small">{rate.etaDays} days ETA</span>
                </div>
                <span className="badge badge-blue">₹{rate.price}</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      <div style={{ marginTop: "1.5rem" }}>
        <button
          className="btn"
          type="button"
          disabled={!selectedRateId || saving}
          onClick={handleSelect}
        >
          {saving ? "Saving…" : "Confirm & Continue"}
        </button>
      </div>
    </Layout>
  );
}
