"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps {
    options: { label: string; value: string }[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    className?: string;
}

const SegmentedControl = ({ options, selectedValue, onValueChange, className }: SegmentedControlProps) => {
    const selectedIndex = options.findIndex(option => option.value === selectedValue);
    
    return (
        <div className={cn("relative flex w-full p-1 rounded-md bg-muted", className)}>
            {/* 슬라이더 배경 */}
            <div 
                className="absolute top-1 bottom-1 bg-background rounded-sm transition-all duration-200 ease-out shadow-sm border border-border"
                style={{
                    left: `${(selectedIndex * 100) / options.length + 0.25}%`,
                    width: `${100 / options.length - 0.5}%`
                }}
            />
            
            {options.map((option) => (
                <button
                    key={option.value}
                    className={cn(
                        "relative z-10 flex-1 py-2 px-4 text-center text-sm font-medium transition-colors duration-200 ease-out rounded-sm",
                        selectedValue === option.value
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => onValueChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default SegmentedControl;
