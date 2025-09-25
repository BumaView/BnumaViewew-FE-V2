"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "outline" | "ghost" | "link";
    size?: "sm" | "md" | "lg";
    className?: string;
    disabled?: boolean;
    isWide?: boolean;
}

const Button = ({ 
    variant = "default", 
    size = "md", 
    className, 
    disabled = false, 
    isWide = false, 
    children,
    ...props 
}: ButtonProps) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    
    const sizeClasses = {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-8 text-base"
    };

    const variantClasses = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
    };

    return (
        <button
            className={cn(
                baseClasses,
                sizeClasses[size],
                variantClasses[variant],
                isWide ? "w-full" : "",
                className || ""
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;