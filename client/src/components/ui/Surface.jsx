import React from 'react';
import { motion } from 'framer-motion';

/**
 * Modular Surface Container
 * Uses semantic theme dualing tokens (bg-surface, bg-surface-raised, bg-surface-subtle, border-subtle)
 */
export default function Surface({
  children,
  variant = 'default',
  className = '',
  interactive = false,
  onClick,
  ...props
}) {
  const variantStyles = {
    default: 'bg-surface border border-subtle rounded-2xl shadow-soft-sm',
    raised: 'bg-surface-raised border border-subtle rounded-xl shadow-soft-md',
    subtle: 'bg-surface-subtle border border-subtle rounded-xl',
    interactive: 'bg-surface border border-subtle rounded-2xl shadow-soft-sm hover:shadow-soft-md hover:border-border-muted transition-all cursor-pointer',
    flat: 'bg-surface-subtle rounded-xl',
  };

  const Component = interactive ? motion.div : 'div';
  const motionProps = interactive
    ? {
        whileHover: { y: -2, transition: { duration: 0.15 } },
        whileTap: { scale: 0.995 },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`${variantStyles[variant] || variantStyles.default} ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}
