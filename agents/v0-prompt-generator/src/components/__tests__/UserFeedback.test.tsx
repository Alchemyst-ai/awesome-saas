import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  FeedbackProvider,
  useFeedback,
  NetworkStatusIndicator,
} from '../UserFeedback';

// Test component that uses the feedback hook
const TestFeedbackComponent = () => {
  const { showSuccess, showError, showWarning, showInfo, clearAllFeedback } =
    useFeedback();

  return (
    <div>
      <button onClick={() => showSuccess('Success', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => showError('Error', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => showWarning('Warning', 'Be careful')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Info', 'Just so you know')}>
        Show Info
      </button>
      <button onClick={clearAllFeedback}>Clear All</button>
    </div>
  );
};

describe('FeedbackProvider and useFeedback', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders children without feedback messages initially', () => {
    render(
      <FeedbackProvider>
        <div>Test content</div>
      </FeedbackProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Notifications' })
    ).not.toBeInTheDocument();
  });

  it('shows success feedback message', async () => {
    render(
      <FeedbackProvider>
        <TestFeedbackComponent />
      </FeedbackProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });
  });

  it('shows error feedback message', async () => {
    render(
      <FeedbackProvider>
        <TestFeedbackComponent />
      </FeedbackProvider>
    );

    fireEvent.click(screen.getByText('Show Error'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('shows warning feedback message', async () => {
    render(
      <FeedbackProvider>
        <TestFeedbackComponent />
      </FeedbackProvider>
    );

    fireEvent.click(screen.getByText('Show Warning'));

    await waitFor(() => {
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Be careful')).toBeInTheDocument();
    });
  });

  it('shows info feedback message', async () => {
    render(
      <FeedbackProvider>
        <TestFeedbackComponent />
      </FeedbackProvider>
    );

    fireEvent.click(screen.getByText('Show Info'));

    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Just so you know')).toBeInTheDocument();
    });
  });

  it('auto-hides non-persistent messages after duration', async () => {
    render(
      <FeedbackProvider>
        <TestFeedbackComponent />
      </FeedbackProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    // Fast-forward time to trigger auto-hide
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });
  });

  it('keeps persistent messages visible', async () => {
    render(
      <FeedbackProvider>
        <TestFeedbackComponent />
      </FeedbackProvider>
    );

    fireEvent.click(screen.getByText('Show Error')); // Errors are persistent by default

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Error should still be visible
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('allows manual dismissal of messages', async () => {
    render(
      <FeedbackProvider>
        <TestFeedbackComponent />
      </FeedbackProvider>
    );

    fireEvent.click(screen.getByText('Show Error'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    // Click close button
    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });
  });

  it('clears all feedback messages', async () => {
    render(
      <FeedbackProvider>
        <TestFeedbackComponent />
      </FeedbackProvider>
    );

    // Show multiple messages
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    // Clear all
    fireEvent.click(screen.getByText('Clear All'));

    await waitFor(() => {
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });
  });

  it('throws error when useFeedback is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestFeedbackComponent />);
    }).toThrow('useFeedback must be used within a FeedbackProvider');

    console.error = originalError;
  });
});

describe('NetworkStatusIndicator', () => {
  const mockNavigator = {
    onLine: true,
  };

  beforeEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    // Mock addEventListener and removeEventListener
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  it('does not render when online', () => {
    mockNavigator.onLine = true;

    render(
      <FeedbackProvider>
        <NetworkStatusIndicator />
      </FeedbackProvider>
    );

    expect(screen.queryByText('Offline Mode')).not.toBeInTheDocument();
  });

  it('renders offline indicator when offline', () => {
    mockNavigator.onLine = false;

    render(
      <FeedbackProvider>
        <NetworkStatusIndicator />
      </FeedbackProvider>
    );

    expect(screen.getByText('Offline Mode')).toBeInTheDocument();
  });

  it('sets up event listeners for online/offline events', () => {
    render(
      <FeedbackProvider>
        <NetworkStatusIndicator />
      </FeedbackProvider>
    );

    expect(window.addEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
  });
});
