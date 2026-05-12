import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard, type DashboardViewModel } from "../api/dashboard.js";
import { Layout } from "../components/Layout.js";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(({ dashboard: d }) => setDashboard(d))
      .catch((err) => setError(String(err.message)));
  }, []);

  if (error) return <Layout eyebrow="Overview" title="Dashboard"><p className="muted">{error}</p></Layout>;
  if (!dashboard) return <Layout eyebrow="Overview" title="Dashboard"><p className="muted">Loading…</p></Layout>;

  return (
    <Layout eyebrow="Overview" title="Shipping Operations Dashboard">
      <section className="card dashboard-hero">
        <div>
          <p className="page-eyebrow">Control center</p>
          <h2>Operations snapshot for your shipping workflow</h2>
          <p className="muted">Track bookings, monitor delivery states, and act quickly across providers from one unified dashboard.</p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-sm" type="button">Export Summary</button>
          <button className="btn btn-sm btn-soft" type="button">{dashboard.dateRangeLabel}</button>
          <span className="muted small">{dashboard.generatedAt}</span>
        </div>
      </section>

      <section className="grid kpi-grid">
        {dashboard.kpis.map((kpi) => (
          <Link key={kpi.key} to={kpi.href} className="card interactive-card stat-card">
            <p className="stat-label">{kpi.label}</p>
            <p className="stat-value">{kpi.value}</p>
            <p className="muted small">{kpi.change}</p>
          </Link>
        ))}
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Delivery Partner Shipment Status</h2>
          <Link className="link" to="/orders?status=pickupsAndManifests">View All</Link>
        </div>
        <div className="grid status-grid">
          {dashboard.shipmentStatuses.map((status) => (
            <Link key={status.key} to={status.href} className="interactive-card status-card">
              <p className="muted small">{status.label}</p>
              <p className="status-count">{status.count}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <span className="badge badge-slate">Route-ready</span>
        </div>
        <div className="grid quick-actions-grid">
          {dashboard.quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.disabled ? "#" : action.href}
              className={`interactive-card quick-action${action.disabled ? " is-disabled" : ""}`}
              aria-disabled={action.disabled}
            >
              <p><strong>{action.label}</strong></p>
              <p className="muted small">{action.helper}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid analytics-grid">
        <article className="card">
          <div className="section-header">
            <h2>Shipment Summary Trend</h2>
            <span className="badge badge-blue">Mock analytics</span>
          </div>
          <div className="mini-chart" aria-hidden="true">
            {[42, 58, 67, 51, 73, 82, 76].map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="muted small">Weekly booking and delivery movement.</p>
        </article>

        <article className="card">
          <div className="section-header">
            <h2>Provider Distribution</h2>
            <Link className="link" to="/quotes">Optimize Routes</Link>
          </div>
          <div className="stack-list">
            {dashboard.providerDistribution.map((provider) => (
              <div key={provider.provider} className="stack-row">
                <div className="row-stack">
                  <strong>{provider.provider}</strong>
                  <span className="muted small">{provider.shipments} tracked shipments</span>
                </div>
                <span className="badge badge-slate">{provider.share}% share</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="stack-list">
            {dashboard.activity.map((item, i) => (
              <div key={i} className="stack-row">
                <div className="row-stack">
                  <strong>{item.title}</strong>
                  <span className="muted small">{item.helper}</span>
                </div>
                <span className="muted small">{item.time}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="section-header">
            <h2>Wallet Transactions</h2>
          </div>
          <div className="stack-list">
            {dashboard.walletTransactions.map((txn, i) => (
              <div key={i} className="stack-row">
                <div className="row-stack">
                  <strong>{txn.title}</strong>
                  <span className="muted small">{txn.date}</span>
                </div>
                <span className={`badge ${txn.type === "credit" ? "badge-green" : "badge-amber"}`}>
                  {txn.amount}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link className="link" to="/orders">View All Orders</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Shipment Label</th>
                <th>Type</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentOrders.map((order) => (
                <tr key={order.orderId}>
                  <td><strong>{order.orderId}</strong></td>
                  <td>{order.customerName}</td>
                  <td>{order.shipmentLabel}</td>
                  <td>
                    <span className={`badge ${order.orderType === "COD" ? "badge-amber" : "badge-blue"}`}>
                      {order.orderType}
                    </span>
                  </td>
                  <td><span className={`badge ${order.statusBadgeClass}`}>{order.status}</span></td>
                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
