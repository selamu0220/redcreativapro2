'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useViewport } from '../hooks/useViewport';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

interface MobileNotificationManagerProps {
  notifications: NotificationProps[];
  onDismiss: (id: string) => void;
  position?: 'top' | 'bottom';
  maxVisible?: number;
}

const MobileNotification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { isMobile } = useViewport();

  useEffect(() => {
    // Entrada con animación
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div
      className={`
        mobile-notification
        ${getTypeStyles()}
        ${isVisible ? 'mobile-notification-visible' : ''}
        ${isExiting ? 'mobile-notification-exiting' : ''}
        ${isMobile ? 'mobile-notification-mobile' : ''}
      `}
      style={{
        transform: isVisible && !isExiting ? 'translateY(0)' : 'translateY(-100%)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.3s ease-out'
      }}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {message && (
            <p className="mt-1 text-sm opacity-90">{message}</p>
          )}
          {action && (
            <div className="mt-2">
              <button
                onClick={action.onClick}
                className="text-sm font-medium underline hover:no-underline focus:outline-none"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MobileNotificationManager: React.FC<MobileNotificationManagerProps> = ({
  notifications,
  onDismiss,
  position = 'top',
  maxVisible = 3
}) => {
  const { isMobile } = useViewport();
  const visibleNotifications = notifications.slice(0, maxVisible);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        mobile-notification-container
        ${position === 'top' ? 'mobile-notification-top' : 'mobile-notification-bottom'}
        ${isMobile ? 'mobile-notification-container-mobile' : ''}
      `}
    >
      {visibleNotifications.map((notification) => (
        <MobileNotification
          key={notification.id}
          {...notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  );
};

// Hook para gestionar notificaciones
export const useMobileNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationProps, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: NotificationProps = {
      ...notification,
      id
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Vibración háptica en móvil
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      switch (notification.type) {
        case 'success':
          navigator.vibrate(100);
          break;
        case 'error':
          navigator.vibrate([100, 50, 100]);
          break;
        case 'warning':
          navigator.vibrate([50, 50, 50]);
          break;
        default:
          navigator.vibrate(50);
      }
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<NotificationProps>) => {
    return addNotification({ type: 'success', title, message, ...options });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, options?: Partial<NotificationProps>) => {
    return addNotification({ type: 'error', title, message, ...options });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<NotificationProps>) => {
    return addNotification({ type: 'warning', title, message, ...options });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<NotificationProps>) => {
    return addNotification({ type: 'info', title, message, ...options });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

// Componente Toast simple para notificaciones rápidas
export const MobileToast: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}> = ({ message, type = 'info', isVisible, onClose }) => {
  const { isMobile } = useViewport();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div
      className={`
        mobile-toast
        ${getToastStyles()}
        ${isMobile ? 'mobile-toast-mobile' : ''}
      `}
      style={{
        position: 'fixed',
        bottom: isMobile ? '20px' : '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 10000,
        maxWidth: isMobile ? 'calc(100vw - 40px)' : '400px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: 'mobile-scale-in 0.3s ease-out'
      }}
    >
      {message}
    </div>
  );
};

export default MobileNotificationManager;