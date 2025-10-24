import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variants = {
    primary: 'bg-blue-primary hover:bg-blue-light active:bg-blue-dark text-white shadow-lg hover:shadow-blue-glow',
    secondary: 'bg-transparent border-2 border-blue-primary text-blue-primary hover:bg-blue-primary hover:text-white',
    danger: 'bg-red-loss hover:bg-red-600 active:bg-red-700 text-white shadow-lg',
  };

  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
