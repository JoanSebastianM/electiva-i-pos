import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface StyledButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export default function StyledButton({ variant = 'primary', children, className = '', ...props }: StyledButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary: 'bg-granizado-500 text-white hover:bg-granizado-600',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
