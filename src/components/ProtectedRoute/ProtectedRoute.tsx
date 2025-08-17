import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";
import { routes } from "../../routes";
import "./ProtectedRoute.css";

export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    if (!isAuthenticated) {
        return <Navigate to={routes.login} replace />;
    }
    return <Outlet />;
}
