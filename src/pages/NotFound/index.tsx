import { Link } from "react-router-dom";
import { routes } from "../../routes";
import "./NotFound.css";

export default function NotFound() {
    return (
        <div className="nfPage">
            <div className="nfCard card">
                <h1 className="nfTitle">404</h1>
                <p className="nfText text-muted">The page you are looking for does not exist.</p>
                <Link className="nfLink" to={routes.home}>Go back home</Link>
            </div>
        </div>
    );
}
