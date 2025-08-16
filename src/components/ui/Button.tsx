import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    fullWidth?: boolean;
};

export default function Button({ variant = "primary", fullWidth = false, style, children, disabled, ...rest }: ButtonProps) {
    const baseStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        borderRadius: "var(--radius-sm)",
        borderWidth: 1,
        borderStyle: "solid",
        padding: "8px 16px",
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "background-color 120ms ease, opacity 120ms ease, border-color 120ms ease",
        width: fullWidth ? "100%" : undefined,
    };

    const variants: Record<string, React.CSSProperties> = {
        primary: {
            background: "var(--color-primary)",
            color: "#fff",
            borderColor: "transparent",
        },
        secondary: {
            background: "var(--color-surface-2)",
            color: "var(--color-text)",
            borderColor: "var(--color-border)",
        },
        danger: {
            background: "var(--color-danger)",
            color: "#fff",
            borderColor: "transparent",
        },
        ghost: {
            background: "transparent",
            color: "var(--color-text)",
            borderColor: "var(--color-border)",
        },
    };

    return (
        <button style={{ ...baseStyle, ...variants[variant], ...style }} disabled={disabled} {...rest}>
            {children}
        </button>
    );
}
