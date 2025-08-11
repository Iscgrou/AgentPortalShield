import React from "react";

export function Slider({ 
    value, 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1,
    disabled = false,
    id,
    className = ""
}) {
    const handleChange = (e) => {
        const newValue = parseFloat(e.target.value);
        if (onValueChange) {
            onValueChange([newValue]);
        }
    };

    return (
        <div className={`relative flex items-center ${className}`}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                disabled={disabled}
                id={id}
                className={`
                    w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    slider-thumb:appearance-none slider-thumb:w-5 slider-thumb:h-5 
                    slider-thumb:rounded-full slider-thumb:bg-blue-600 slider-thumb:cursor-pointer
                    slider-thumb:shadow-md slider-thumb:hover:bg-blue-700 slider-thumb:transition-colors
                `}
                style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%, #E5E7EB 100%)`
                }}
            />
            <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: background-color 0.2s;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                    background: #2563EB;
                }
                input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: background-color 0.2s;
                }
                input[type="range"]::-moz-range-thumb:hover {
                    background: #2563EB;
                }
            `}</style>
        </div>
    );
}