import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { routes } from "../routes";
import { toast } from "react-hot-toast";
import "./Login.css";

// Icon component interface
interface IconProps {
    size?: number;
    color?: string;
}

// Enterprise-styled icons
const Icons = {
    Lock: ({ size = 20, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    ),
    Mail: ({ size = 20, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
    ),
    Eye: ({ size = 20, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    ),
    EyeOff: ({ size = 20, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    ),
    LogIn: ({ size = 20, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
    ),
    Shield: ({ size = 20, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    )
};

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const loading = useAuthStore((s) => s.loading);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await login(email, password);
        toast.success("Welcome back");
        navigate(routes.home, { replace: true });
    }

    return (
        <div className="loginPage">
            <div className="loginContainer">
                <div className="loginCard">
                    <div className="loginHeader">
                        <div className="loginLogo">
                            <Icons.Shield size={28} />
                        </div>
                        <h1 className="loginTitle">Fraud Detection</h1>
                        <p className="loginSubtitle">Sign in to access your dashboard</p>
                    </div>
                    
                    <form className="loginForm" onSubmit={handleSubmit}>
                        <div className="formGroup">
                            <label className="inputLabel" htmlFor="email">Email Address</label>
                            <div className="inputWrapper">
                                <div className="inputIcon">
                                    <Icons.Mail size={16} />
                                </div>
                                <input 
                                    id="email"
                                    type="email" 
                                    className="formInput" 
                                    required 
                                    placeholder="you@company.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                            </div>
                        </div>
                        
                        <div className="formGroup">
                            <label className="inputLabel" htmlFor="password">Password</label>
                            <div className="inputWrapper">
                                <div className="inputIcon">
                                    <Icons.Lock size={16} />
                                </div>
                                <input 
                                    id="password"
                                    type={showPassword ? "text" : "password"} 
                                    className="formInput" 
                                    required 
                                    placeholder="••••••••" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                                <button 
                                    type="button"
                                    className="passwordToggle" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" className="loginButton" disabled={loading}>
                            {loading ? "Signing in..." : (
                                <>
                                    <span>Sign in</span>
                                    <Icons.LogIn size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="loginFooter">
                    <p>© {new Date().getFullYear()} Fraud Detection. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
