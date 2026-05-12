import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getOrders, syncOrders, orderAction, type OrderRow, type OrdersResponse } from "../api/orders.js";
import { Layout } from "../components/Layout.js";

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") ?? "all";
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = () => {
    setLoading(true);
    getOrders(status)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const handleSync = async () => {
    setSyncing(true);
    await syncOrders().catch(() => null);
    setSyncing(false);
    load();
  };

  const handleAction = async (orderId: string, action: string) => {
    await orderAction(orderId, action).catch(() => null);
    load();
  };

  return (
    <Layout eyebrow="Fulfillment" title="Orders">
      <div className="section-header" style={{ marginBottom: "1rem" }}>
        <div />
        <button className="btn btn-sm" type="button" onClick={handleSync} disabled={syncing}>
          {syncing ? "Syncing…" : "Sync from Shopify"}
        </button>
      </div>

      {data && (
        <div className="tabs-row" style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {data.statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`btn btn-sm ${status === opt.value ? "" : "btn-soft"}`}
              onClick={() => setSearchParams({ status: opt.value })}
            >
              {opt.label}
              {data.statusCounts[opt.value] !== undefined && (
                <span className="badge badge-slate" style={{ marginLeft: "0.4rem" }}>
                  {data.statusCounts[opt.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="muted">Loading…</p>}

      {!loading && data && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.length === 0 && (
                <tr><td colSpan={4} className="muted" style={{ textAlign: "center" }}>No orders found.</td></tr>
              )}
              {data.orders.map((order: OrderRow) => (
                <tr key={order.id}>
                  <td><strong>{String(order.orderNumber)}</strong></td>
                  <td>{String(order.customerName)}</td>
                  <td><span className="badge badge-slate">{String(order.operationalStatus)}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <Link className="btn btn-sm btn-soft" to={`/dispatch/${order.id}`}>Dispatch</Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-soft"
                        onClick={() => handleAction(String(order.id), "clone")}
                      >
                        Clone
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-soft"
                        onClick={() => handleAction(String(order.id), "archive")}
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
