import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import ModalRoot from "../components/ModalRoot/ModalRoot";
import { routes } from "../routes";
import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Transactions from "../pages/Transactions/Transactions";
import Users from "../pages/Users/Users";
import Settings from "../pages/Settings/Settings";
import NotFound from "../pages/NotFound/NotFound";
import "./App.css";

function App() {
    return (
        <div className="app_container">
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: { zIndex: 60 },
                    success: { style: { background: "var(--color-surface-primary)", color: "var(--color-text-primary)" } },
                    error: { style: { background: "var(--color-danger-500)", color: "var(--color-text-primary)" } },
                }}
            />
            <ModalRoot />
            <Routes>
                <Route path={routes.login} element={<Login />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route index element={<Home />} />
                        <Route path={routes.home} element={<Home />} />
                        <Route path={routes.transactions} element={<Transactions />} />
                        <Route path={routes.users} element={<Users />} />
                        <Route path={routes.settings} element={<Settings />} />
                    </Route>
                </Route>
                <Route path={routes.notFound} element={<NotFound />} />
                <Route path="/home" element={<Navigate to={routes.home} replace />} />
            </Routes>
        </div>
    );
}

export default App;
