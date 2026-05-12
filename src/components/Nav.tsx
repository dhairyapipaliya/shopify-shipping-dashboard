import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";

type Props = { activePage?: string };

export function Nav({ activePage: _activePage }: Props) {
  const { logout } = useAuth();

  return (
    <aside className="sidebar" id="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">S</div>
        <div>
          <p className="brand-eyebrow">Operations</p>
          <h2>Shipping Admin</h2>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/" end>
          <span>Dashboard</span>
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/orders">
          <span>Orders</span>
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/warehouse">
          <span>Warehouse</span>
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/admin/test-quotes">
          <span>Test Quotes</span>
        </NavLink>
      </nav>

      <button className="btn btn-ghost btn-block" type="button" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
