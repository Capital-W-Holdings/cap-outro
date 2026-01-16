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
        bg-white border border-gray-200
        ${paddingStyles[padding]}
        ${hover ? 'transition-colors hover:border-gray-400' : ''}
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
    <h3 className={`font-mono text-lg font-semibold text-black ${className}`}>{children}</h3>
  );
}

export function CardDescription({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
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
    <div className={`flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}
