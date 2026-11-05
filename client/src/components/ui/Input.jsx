import React from 'react';

/**
 * Modular Dual-Theme Input Component
 */
export default function Input({
  icon: Icon,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      {Icon && (
        <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      )}
      <input
        className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-1.5 rounded-xl bg-surface-subtle border border-subtle text-primary placeholder:text-muted text-xs transition-colors focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/20 ${className}`}
        {...props}
      />
    </div>
  );
}
