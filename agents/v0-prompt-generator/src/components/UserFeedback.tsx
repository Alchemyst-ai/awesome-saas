'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
}

interface FeedbackContextType {
  messages: FeedbackMessage[];
  showFeedback: (feedback: Omit<FeedbackMessage, 'id'>) => string;
  hideFeedback: (id: string) => void;
  clearAllFeedback: () => void;
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, persistent?: boolean) => string;
  showWarning: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

/**
 * Provider component for user feedback system
 */
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const showFeedback = useCallback((feedback: Omit<FeedbackMessage, 'id'>) => {
    const id = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: FeedbackMessage = {
      id,
      duration: 5000, // Default 5 seconds
      persistent: false,
      ...feedback,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Auto-hide non-persistent messages
    if (
      !newMessage.persistent &&
      newMessage.duration &&
      newMessage.duration > 0
    ) {
      setTimeout(() => {
        hideFeedback(id);
      }, newMessage.duration);
    }

    return id;
  }, []);

  const hideFeedback = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const clearAllFeedback = useCallback(() => {
    setMessages([]);
  }, []);

  // Convenience methods for different feedback types
  const showSuccess = useCallback(
    (title: string, message: string, duration = 4000) => {
      return showFeedback({ type: 'success', title, message, duration });
    },
    [showFeedback]
  );

  const showError = useCallback(
    (title: string, message: string, persistent = true) => {
      return showFeedback({ type: 'error', title, message, persistent });
    },
    [showFeedback]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration = 6000) => {
      return showFeedback({ type: 'warning', title, message, duration });
    },
    [showFeedback]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration = 5000) => {
      return showFeedback({ type: 'info', title, message, duration });
    },
    [showFeedback]
  );

  const contextValue: FeedbackContextType = {
    messages,
    showFeedback,
    hideFeedback,
    clearAllFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <FeedbackContainer />
    </FeedbackContext.Provider>
  );
}

/**
 * Hook to use the feedback system
 */
export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

/**
 * Container component that renders all feedback messages
 */
function FeedbackContainer() {
  const { messages, hideFeedback } = useFeedback();

  if (messages.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
      role="region"
      aria-label="Notifications"
    >
      {messages.map((message) => (
        <FeedbackMessage
          key={message.id}
          message={message}
          onClose={() => hideFeedback(message.id)}
        />
      ))}
    </div>
  );
}

/**
 * Individual feedback message component
 */
function FeedbackMessage({
  message,
  onClose,
}: {
  message: FeedbackMessage;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`
        ${getBackgroundColor()}
        border rounded-lg shadow-lg p-4 transition-all duration-300 transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
      aria-live={message.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">{message.title}</h4>
          <p className="mt-1 text-sm text-gray-700">{message.message}</p>

          {message.actions && message.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {message.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`
                    text-xs font-medium px-3 py-1 rounded-md transition-colors
                    ${
                      action.style === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Network status indicator component
 */
export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const { showWarning, showSuccess } = useFeedback();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showOfflineMessage) {
        showSuccess('Connection Restored', 'You are back online');
        setShowOfflineMessage(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      showWarning(
        'Connection Lost',
        'You are currently offline. Some features may not work properly.',
        0 // Persistent
      );
    };

    // Initial check
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showWarning, showSuccess, showOfflineMessage]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg z-40">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-yellow-600 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium text-yellow-800">
          Offline Mode
        </span>
      </div>
    </div>
  );
}
