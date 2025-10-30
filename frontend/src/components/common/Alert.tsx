import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  dismissible = true,
  onDismiss,
  autoClose = false,
  autoCloseTime = 5000,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, visible]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle className="h-5 w-5 text-success-400" />,
      bg: 'bg-success-50',
      border: 'border-success-400',
      textColor: 'text-success-700'
    },
    error: {
      icon: <XCircle className="h-5 w-5 text-error-400" />,
      bg: 'bg-error-50',
      border: 'border-error-400',
      textColor: 'text-error-700'
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-warning-400" />,
      bg: 'bg-warning-50',
      border: 'border-warning-400',
      textColor: 'text-warning-700'
    },
    info: {
      icon: <Info className="h-5 w-5 text-primary-400" />,
      bg: 'bg-primary-50',
      border: 'border-primary-400',
      textColor: 'text-primary-700'
    }
  };

  const { icon, bg, border, textColor } = typeConfig[type];

  return (
    <div className={`${bg} border-l-4 ${border} p-4 rounded-md ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          )}
          <div className={`text-sm ${textColor} mt-1`}>{message}</div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColor}`}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;