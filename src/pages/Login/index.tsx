import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";
import { routes } from "../../routes";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { toast } from "react-hot-toast";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const loading = useAuthStore((s) => s.loading);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await login(email, password);
        toast.success("Welcome back");
        navigate(routes.home, { replace: true });
    }

    return (
        <div className="loginPage">
            <form className="loginCard card" onSubmit={handleSubmit}>
                <h2 className="loginTitle">Fraud Admin Login</h2>
                <p className="loginSubtitle text-muted">Sign in to access the dashboard</p>
                <div className="loginFields">
                    <Input label="Email" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input label="Password" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Button type="submit" disabled={loading} fullWidth>
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
