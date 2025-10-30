import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200 ease-in-out';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  
  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500',
    success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-success-500',
    danger: 'bg-error-600 hover:bg-error-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-error-500',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-2 focus:ring-offset-2 focus:ring-warning-500',
    info: 'bg-primary-100 hover:bg-primary-200 text-primary-800 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-2 focus:ring-primary-500'
  };
  
  const disabledStyles = 'opacity-50 cursor-not-allowed';
  
  const buttonClasses = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    (disabled || isLoading) ? disabledStyles : '',
    className
  ].join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;