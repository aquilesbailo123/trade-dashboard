import { Link } from "react-router-dom";
import { routes } from "../routes";

export default function NotFound() {
    return (
        <div style={{ display: "grid", placeItems: "center", height: "100vh", textAlign: "center", padding: 16 }}>
            <div>
                <h1 style={{ marginTop: 0 }}>404</h1>
                <p className="text-muted">The page you are looking for does not exist.</p>
                <Link to={routes.home}>Go back home</Link>
            </div>
        </div>
    );
}
