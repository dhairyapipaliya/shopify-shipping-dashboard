import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.js";
import { LoginPage } from "./pages/Login.js";
import { DashboardPage } from "./pages/Dashboard.js";
import { OrdersPage } from "./pages/Orders.js";
import { DispatchPage } from "./pages/Dispatch.js";
import { WarehousePage } from "./pages/Warehouse.js";
import { TestQuotesPage } from "./pages/TestQuotes.js";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  if (auth.status === "loading") return <div className="muted" style={{ padding: "2rem" }}>Loading…</div>;
  if (auth.status === "unauthenticated") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const auth = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={auth.status === "authenticated" ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
      <Route path="/dispatch/:orderId" element={<RequireAuth><DispatchPage /></RequireAuth>} />
      <Route path="/warehouse" element={<RequireAuth><WarehousePage /></RequireAuth>} />
      <Route path="/admin/test-quotes" element={<RequireAuth><TestQuotesPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
