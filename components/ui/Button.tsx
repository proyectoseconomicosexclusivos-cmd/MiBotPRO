import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  fullWidth = false,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  
  const variantClasses = {
    primary: "text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500",
    secondary: "text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400",
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClasses = props.disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClasses} ${className}`}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;