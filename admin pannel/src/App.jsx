import { Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import AdminLayout from "./components/AdminLayout";
import AdminAddPlant from "./pages/AdminAddPlant";
import Dashboard from "./pages/Dashboard";
import EditPlant from "./pages/EditPlant";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import ProductList from "./pages/list";

const TOKEN_KEY = "naturevibes_admin_token";

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");

  const handleLogin = (nextToken) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/"
        element={
          token ? (
            <AdminLayout onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard token={token} />} />
        <Route path="orders" element={<Orders token={token} />} />
        <Route path="list" element={<ProductList token={token} />} />
        <Route path="add-plant" element={<AdminAddPlant token={token} />} />
        <Route path="edit-plant/:productId" element={<EditPlant token={token} />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};

export default App;
