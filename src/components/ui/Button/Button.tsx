import React from "react";
import "./Button.css";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    fullWidth?: boolean;
};

export default function Button({ 
    variant = "primary", 
    fullWidth = false, 
    className = "", 
    children, 
    disabled, 
    ...rest 
}: ButtonProps) {
    const getButtonClass = () => {
        const buttonClasses = [
            "button_base",
            `button_${variant}`,
            fullWidth ? "button_full_width" : "",
            disabled ? "button_disabled" : "",
            className
        ].filter(Boolean).join(" ");
        
        return buttonClasses;
    };

    return (
        <button 
            className={getButtonClass()}
            disabled={disabled} 
            {...rest}
        >
            {children}
        </button>
    );
}
