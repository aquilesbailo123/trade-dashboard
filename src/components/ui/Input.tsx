import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
};

export default function Input({ label, error, className = "", ...rest }: InputProps) {
    return (
        <label className="block w-full">
            {label && (
                <div className="mb-1 text-sm text-[var(--color-text-muted)]">{label}</div>
            )}
            <input
                className={`w-full bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${className}`}
                {...rest}
            />
            {error && (
                <div className="mt-1 text-xs text-[var(--color-danger)]">{error}</div>
            )}
        </label>
    );
}
