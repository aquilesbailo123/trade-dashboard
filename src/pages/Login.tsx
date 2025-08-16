import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { routes } from "../routes";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { toast } from "react-hot-toast";

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
        <div style={{ display: "grid", placeItems: "center", height: "100vh", padding: 16 }}>
            <form className="card" onSubmit={handleSubmit} style={{ width: 400, padding: 24 }}>
                <h2 style={{ marginTop: 0 }}>Fraud Admin Login</h2>
                <p className="text-muted" style={{ marginTop: 0 }}>Sign in to access the dashboard</p>
                <div style={{ display: "grid", gap: 12 }}>
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
