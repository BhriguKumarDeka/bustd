import React from 'react';

/**
 * Modular Badge Component
 * Standardizes compliance statuses, counts, and classification tags across the platform.
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon: Icon,
}) {
  const variantStyles = {
    issue: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold',
    review: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold',
    pass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold',
    neutral: 'bg-surface-subtle text-secondary border border-subtle font-medium',
    accent: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 font-bold border border-pink-500/20',
    count: 'badge-count font-mono font-bold',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
    lg: 'text-xs px-3 py-1.5 rounded-full',
  };

  if (variant === 'count') {
    return (
      <span className={`badge-count ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.neutral} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
