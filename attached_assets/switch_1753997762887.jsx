import React from "react";

export function Switch({ 
    checked, 
    onCheckedChange, 
    disabled = false,
    id,
    className = ""
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange && onCheckedChange(!checked)}
            id={id}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
                ${checked 
                    ? 'bg-blue-600' 
                    : 'bg-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
        >
            <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
                    ${checked ? 'translate-x-6' : 'translate-x-1'}
                `}
            />
        </button>
    );
}