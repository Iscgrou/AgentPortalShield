import React from "react";
import { Check } from "lucide-react";

export function Checkbox({ 
    checked, 
    onCheckedChange, 
    disabled = false,
    id,
    className = ""
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange && onCheckedChange(!checked)}
            id={id}
            className={`
                relative w-4 h-4 rounded border-2 transition-all duration-200 ease-in-out
                ${checked 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
        >
            {checked && (
                <Check className="w-3 h-3 absolute top-0 left-0 text-white" />
            )}
        </button>
    );
}