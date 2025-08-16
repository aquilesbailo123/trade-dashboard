import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { routes } from "../routes";
import { useAuthStore } from "../stores/auth";
import Button from "../components/ui/Button";
import "./DashboardLayout.css";

export default function DashboardLayout() {
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);

    return (
        <div className="layoutRoot">
            <aside className="layoutSidebar">
                <div className="layoutBrand">Fraud Detection Admin</div>
                <nav className="layoutNav">
                    <NavLink to={routes.home} className={({ isActive }) => `layoutNavLink ${isActive ? "is-active" : ""}`}>Dashboard</NavLink>
                    <NavLink to={routes.transactions} className={({ isActive }) => `layoutNavLink ${isActive ? "is-active" : ""}`}>Transactions</NavLink>
                    <NavLink to={routes.users} className={({ isActive }) => `layoutNavLink ${isActive ? "is-active" : ""}`}>Users</NavLink>
                    <NavLink to={routes.settings} className={({ isActive }) => `layoutNavLink ${isActive ? "is-active" : ""}`}>Settings</NavLink>
                </nav>
                <hr className="divider layoutDivider" />
                <Button variant="secondary" fullWidth onClick={() => { logout(); navigate(routes.login, { replace: true }); }}>
                    Logout
                </Button>
            </aside>
            <main className="layoutMain">
                <header className="layoutHeader">
                    <div className="layoutHeader__title">Overview</div>
                    <div className="layoutHeader__meta">v1.0.0</div>
                </header>
                <section className="layoutContent">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
