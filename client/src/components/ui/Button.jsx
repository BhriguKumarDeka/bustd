import React from 'react';

/**
 * Modular Button Component
 * Standardizes primary, secondary, gradient, and ghost actions across the app.
 */
export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const variantStyles = {
    gradient: 'btn-shimmer bg-gradient-bustd text-white font-semibold shadow-sm hover:opacity-95 active:scale-[0.98]',
    primary: 'bg-primary text-inverse hover:opacity-90 font-semibold active:scale-[0.98]',
    secondary: 'bg-surface-raised hover:bg-surface-interactive text-primary border border-subtle font-medium transition-colors active:scale-[0.98]',
    ghost: 'text-secondary hover:text-primary hover:bg-surface-subtle transition-colors',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm active:scale-[0.98]',
    subtle: 'bg-surface-subtle hover:bg-surface-interactive text-secondary hover:text-primary border border-subtle transition-colors',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-xs px-4 py-2 rounded-xl gap-2',
    lg: 'text-sm px-5 py-2.5 rounded-xl gap-2.5',
    icon: 'p-2 rounded-xl',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.secondary} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}
