import { Link } from "react-router-dom";
import { routes } from "../../routes";
import "./NotFound.css";

// Icon component interface
interface IconProps {
    size?: number;
    color?: string;
}

// Enterprise-styled icons
const Icons = {
    Home: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    ),
    AlertTriangle: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    )
};

export default function NotFound() {
    return (
        <div className="not_found_page">
            <div className="not_found_card">
                <div className="not_found_icon">
                    <Icons.AlertTriangle size={48} />
                </div>
                <h1 className="not_found_title">404</h1>
                <p className="not_found_text">The page you are looking for could not be found.</p>
                <Link className="not_found_button" to={routes.home}>
                    <Icons.Home size={16} />
                    <span>Return to Dashboard</span>
                </Link>
            </div>
        </div>
    );
}
