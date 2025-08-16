import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import ModalRoot from "./components/ModalRoot";
import { routes } from "./routes";
import Login from "./pages/Login/index";
import Home from "./pages/Home/Home";
import Transactions from "./pages/Transactions/index";
import Users from "./pages/Users/index";
import Settings from "./pages/Settings/index";
import NotFound from "./pages/NotFound/index";
import "./App.css";

function App() {
    return (
        <div className="App">
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: { zIndex: 60 },
                    success: { style: { background: "var(--color-surface)", color: "var(--color-text)" } },
                    error: { style: { background: "var(--color-danger)", color: "#fff" } },
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

export default App
