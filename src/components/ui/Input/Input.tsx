import React from "react";
import "./Input.css";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
};

export default function Input({ label, error, className = "", ...rest }: InputProps) {
    return (
        <label className="input_container">
            {label && (
                <div className="input_label">{label}</div>
            )}
            <input
                className={`input_field ${error ? "input_field_error" : ""} ${className}`}
                {...rest}
            />
            {error && (
                <div className="input_error_message">{error}</div>
            )}
        </label>
    );
}
