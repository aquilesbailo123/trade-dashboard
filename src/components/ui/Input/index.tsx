import React, { useState } from "react";
import "./Input.css";

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
    label?: string;
    error?: string;
    size?: "sm" | "md" | "lg";
    floating?: boolean;
    icon?: React.ReactNode;
    loading?: boolean;
};

export default function Input({
    label,
    error,
    className = "",
    size = "md",
    floating = false,
    icon,
    loading = false,
    disabled,
    value,
    defaultValue,
    ...rest
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== "" || 
                    defaultValue !== undefined && defaultValue !== "";
    
    const inputClasses = [
        "input",
        `input--${size}`,
        error ? "input--error" : "",
        disabled ? "input--disabled" : "",
        floating ? "input--floating" : "",
        hasValue ? "input--has-value" : "",
        icon ? "input--with-icon" : "",
        loading ? "input--loading" : "",
        className
    ].filter(Boolean).join(" ");

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        rest.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        rest.onBlur?.(e);
    };

    return (
        <div className={inputClasses}>
            {!floating && label && (
                <div className="input__label">{label}</div>
            )}
            
            <div className="input__wrapper">
                <input
                    className="input__field"
                    disabled={disabled}
                    value={value}
                    defaultValue={defaultValue}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...rest}
                />
                
                {floating && label && (
                    <label className="input__label">{label}</label>
                )}
                
                {icon && <div className="input__icon">{icon}</div>}
                {loading && <div className="input__loader" />}
                
                <div className="input__highlight" />
            </div>
            
            {error && (
                <div className="input__error-message">{error}</div>
            )}
        </div>
    );
}
