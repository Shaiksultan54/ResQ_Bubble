import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerActions?: ReactNode;
  footerActions?: ReactNode;
  variant?: 'default' | 'bordered' | 'raised';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  headerActions,
  footerActions,
  variant = 'default',
  onClick
}) => {
  const baseClasses = 'bg-white rounded-lg overflow-hidden';
  
  const variantClasses = {
    default: 'shadow',
    bordered: 'border border-gray-200',
    raised: 'shadow-lg'
  };
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {headerActions && (
            <div className="flex items-center">{headerActions}</div>
          )}
        </div>
      )}
      
      <div className="px-6 py-4">{children}</div>
      
      {footerActions && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          {footerActions}
        </div>
      )}
    </div>
  );
};

export default Card;