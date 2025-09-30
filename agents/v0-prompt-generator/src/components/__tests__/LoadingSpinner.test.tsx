import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');

    const srText = screen.getByText('Loading');
    expect(srText).toHaveClass('sr-only');
  });

  it('renders with custom aria-label', () => {
    render(<LoadingSpinner aria-label="Processing data" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Processing data');

    const srText = screen.getByText('Processing data');
    expect(srText).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="md" />);
    expect(screen.getByRole('status')).toHaveClass('w-6', 'h-6');

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8');

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole('status')).toHaveClass('w-12', 'h-12');
  });

  it('applies correct color classes', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />);
    expect(screen.getByRole('status')).toHaveClass('text-blue-600');

    rerender(<LoadingSpinner color="white" />);
    expect(screen.getByRole('status')).toHaveClass('text-white');

    rerender(<LoadingSpinner color="gray" />);
    expect(screen.getByRole('status')).toHaveClass('text-gray-600');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
  });

  it('combines all props correctly', () => {
    render(
      <LoadingSpinner
        size="lg"
        color="white"
        className="my-custom-class"
        aria-label="Custom loading message"
      />
    );

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-8', 'h-8', 'text-white', 'my-custom-class');
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading message');

    const srText = screen.getByText('Custom loading message');
    expect(srText).toBeInTheDocument();
  });

  it('renders SVG with correct attributes', () => {
    render(<LoadingSpinner />);

    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label');

    // Screen reader text should be present
    const srText = screen.getByText('Loading');
    expect(srText).toHaveClass('sr-only');
  });

  it('defaults to medium size and primary color', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-6', 'h-6', 'text-blue-600');
  });

  it('maintains inline-block display', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('inline-block');
  });
});
