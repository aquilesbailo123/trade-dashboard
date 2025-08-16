import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { routes } from "../routes";
import { useAuthStore } from "../stores/auth";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import "./DashboardLayout.css";

// Menu icon SVG component
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useAuthStore((s) => s.logout);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Get the current page title based on the route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === routes.home) return "Dashboard";
        if (path === routes.transactions) return "Transactions";
        if (path === routes.users) return "Users";
        if (path === routes.settings) return "Settings";
        return "Overview";
    };
    
    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);
    
    // Close mobile menu when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.querySelector('.layoutSidebar');
            const menuButton = document.querySelector('.mobileMenuToggle');
            
            if (isMobileMenuOpen && 
                sidebar && 
                menuButton && 
                !sidebar.contains(event.target as Node) && 
                !menuButton.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    return (
        <div className="layoutRoot">
            <aside className={`layoutSidebar ${isMobileMenuOpen ? "is-open" : ""}`}>
                <div className="layoutBrand">Fraud Detection Admin</div>
                <nav className="layoutNav">
                    <NavLink to={routes.home} className={({ isActive }) => `layoutNavLink ${isActive ? "is-active" : ""}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                            <rect x="3" y="3" width="7" height="9"></rect>
                            <rect x="14" y="3" width="7" height="5"></rect>
                            <rect x="14" y="12" width="7" height="9"></rect>
                            <rect x="3" y="16" width="7" height="5"></rect>
                        </svg>
                        Dashboard
                    </NavLink>
                    <NavLink to={routes.transactions} className={({ isActive }) => `layoutNavLink ${isActive ? "is-active" : ""}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        Transactions
                    </NavLink>
                    <NavLink to={routes.users} className={({ isActive }) => `layoutNavLink ${isActive ? "is-active" : ""}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Users
                    </NavLink>
                    <NavLink to={routes.settings} className={({ isActive }) => `layoutNavLink ${isActive ? "is-active" : ""}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Settings
                    </NavLink>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <hr className="divider layoutDivider" />
                    <Button 
                        variant="secondary" 
                        fullWidth 
                        onClick={() => { logout(); navigate(routes.login, { replace: true }); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </Button>
                </div>
            </aside>
            <main className="layoutMain">
                <header className="layoutHeader">
                    <div className="layoutHeader__title">{getPageTitle()}</div>
                    <div className="layoutHeader__meta">v1.0.0</div>
                </header>
                <section className="layoutContent">
                    <Outlet />
                </section>
            </main>
            <button 
                className="mobileMenuToggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                <MenuIcon />
            </button>
        </div>
    );
}
