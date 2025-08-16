import React, { useRef } from "react";
import "./Button.css";

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> & {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    iconOnly?: boolean;
};

export default function Button({
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    className = "",
    children,
    leftIcon,
    rightIcon,
    iconOnly = false,
    onClick,
    ...rest
}: ButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    const buttonClasses = [
        "button",
        `button--${variant}`,
        `button--${size}`,
        fullWidth ? "button--full" : "",
        loading ? "button--loading" : "",
        disabled ? "button--disabled" : "",
        iconOnly ? "button--icon-only" : "",
        className
    ].filter(Boolean).join(" ");

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;
        
        // Create ripple effect
        const button = buttonRef.current;
        if (button) {
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            const ripple = document.createElement("span");
            ripple.className = "button__ripple";
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                button.removeChild(ripple);
            }, 600);
        }
        
        onClick?.(e);
    };

    return (
        <button
            ref={buttonRef}
            className={buttonClasses}
            disabled={disabled || loading}
            onClick={handleClick}
            {...rest}
        >
            {leftIcon && !loading && (
                <span className="button__icon">{leftIcon}</span>
            )}
            
            {children}
            
            {rightIcon && !loading && (
                <span className="button__icon button__icon--right">{rightIcon}</span>
            )}
        </button>
    );
}
