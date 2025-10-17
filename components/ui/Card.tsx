import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-lg font-semibold text-gray-900', className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-gray-600', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };

