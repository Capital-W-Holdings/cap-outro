import type { ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  ...props
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        bg-dark-800 border border-dark-600 rounded-xl
        ${paddingStyles[padding]}
        ${hover ? 'transition-colors hover:border-dark-500' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
  );
}

export function CardDescription({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`text-sm text-gray-400 ${className}`}>{children}</p>;
}

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 mt-4 pt-4 border-t border-dark-600 ${className}`}>
      {children}
    </div>
  );
}
