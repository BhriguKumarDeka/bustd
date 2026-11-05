import React from 'react';
import { motion } from 'framer-motion';

/**
 * DoubleLayerCard provides the nested double-layered surface inspired by the reference UIs:
 * - Outer recessed or soft tinted layer (layer 1)
 * - Inner elevated crisp content surface (layer 2)
 */
export default function DoubleLayerCard({
  children,
  header,
  footer,
  className = '',
  innerClassName = '',
  interactive = false,
  onClick,
  gradientBorder = false,
}) {
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
      {...motionProps}
      className={`double-layer-outer ${gradientBorder ? 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-bustd before:opacity-20 before:rounded-[18px] before:-z-0' : ''} ${className}`}
    >
      {header && <div className="px-2 pt-1 pb-2">{header}</div>}

      <div className={`double-layer-inner p-4 sm:p-5 relative z-10 ${innerClassName}`}>
        {children}
      </div>

      {footer && <div className="px-2 pt-2.5 pb-0.5">{footer}</div>}
    </Component>
  );
}
