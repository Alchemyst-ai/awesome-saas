import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputForm from '../InputForm';
import { UserInput } from '@/types';

// Mock the industry config
jest.mock('@/lib/industry-config', () => ({
  getIndustryDisplayNames: () => ({
    saas: 'Software as a Service',
    ecommerce: 'E-commerce & Retail',
    portfolio: 'Portfolio & Personal',
    corporate: 'Corporate & Business',
  }),
  getAvailableIndustries: () => ['saas', 'ecommerce', 'portfolio', 'corporate'],
}));

describe('InputForm', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<InputForm {...defaultProps} />);

    expect(screen.getByLabelText(/website name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/about your website/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/additional requirements/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /generate v0 prompt/i })
    ).toBeInTheDocument();
  });

  it('displays proper placeholders and help text', () => {
    render(<InputForm {...defaultProps} />);

    expect(screen.getByPlaceholderText(/TaskFlow Pro/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/select your industry/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/describe what your website is about/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the name of your website or business/i)
    ).toBeInTheDocument();
  });

  it('renders industry options correctly', () => {
    render(<InputForm {...defaultProps} />);

    const industrySelect = screen.getByLabelText(/industry/i);
    expect(industrySelect).toBeInTheDocument();

    // Check that options are present
    expect(screen.getByText('Software as a Service')).toBeInTheDocument();
    expect(screen.getByText('E-commerce & Retail')).toBeInTheDocument();
    expect(screen.getByText('Portfolio & Personal')).toBeInTheDocument();
    expect(screen.getByText('Corporate & Business')).toBeInTheDocument();
  });

  it('shows character count for textarea fields', () => {
    render(<InputForm {...defaultProps} />);

    expect(screen.getByText('0/1000')).toBeInTheDocument(); // About info counter
    expect(screen.getByText('0/500')).toBeInTheDocument(); // Additional requirements counter
  });

  it('updates character count when typing', async () => {
    const user = userEvent.setup();
    render(<InputForm {...defaultProps} />);

    const aboutTextarea = screen.getByLabelText(/about your website/i);
    await user.type(aboutTextarea, 'This is a test description');

    expect(screen.getByText('26/1000')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<InputForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/website name is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/industry selection is required/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/about information is required/i)
      ).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    render(<InputForm {...defaultProps} />);

    const websiteNameInput = screen.getByLabelText(/website name/i);
    const aboutTextarea = screen.getByLabelText(/about your website/i);

    // Enter invalid data
    await user.type(websiteNameInput, 'A'); // Too short
    await user.type(aboutTextarea, 'Short'); // Too short

    // Blur to trigger validation
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/website name must be at least 2 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/about information must be at least 10 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('disables submit button when form is invalid', async () => {
    render(<InputForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is valid', async () => {
    const user = userEvent.setup();
    render(<InputForm {...defaultProps} />);

    // Fill in valid data
    await user.type(screen.getByLabelText(/website name/i), 'My Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'This is a detailed description of my website'
    );

    await waitFor(() => {
      const submitButton = screen.getByRole('button', {
        name: /generate v0 prompt/i,
      });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('calls onSubmit with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    render(<InputForm {...defaultProps} />);

    // Fill in valid data
    await user.type(screen.getByLabelText(/website name/i), 'My Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'This is a detailed description of my website'
    );
    await user.type(
      screen.getByLabelText(/additional requirements/i),
      'Some additional requirements'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        websiteName: 'My Website',
        industry: 'saas',
        aboutInfo: 'This is a detailed description of my website',
        additionalRequirements: 'Some additional requirements',
      });
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(<InputForm {...defaultProps} isLoading={true} />);

    expect(screen.getByText(/generating prompt/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // All inputs should be disabled
    expect(screen.getByLabelText(/website name/i)).toBeDisabled();
    expect(screen.getByLabelText(/industry/i)).toBeDisabled();
    expect(screen.getByLabelText(/about your website/i)).toBeDisabled();
    expect(screen.getByLabelText(/additional requirements/i)).toBeDisabled();
  });

  it('initializes with provided initial values', () => {
    const initialValues = {
      websiteName: 'Initial Website',
      industry: 'saas',
      aboutInfo: 'Initial description',
    };

    render(<InputForm {...defaultProps} initialValues={initialValues} />);

    expect(screen.getByDisplayValue('Initial Website')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saas')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial description')).toBeInTheDocument();
  });

  it('shows validation summary when there are errors', async () => {
    const user = userEvent.setup();
    render(<InputForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please fix the following errors/i)
      ).toBeInTheDocument();
    });
  });

  it('shows helpful tips section', () => {
    render(<InputForm {...defaultProps} />);

    expect(screen.getByText(/tips for better results/i)).toBeInTheDocument();
    expect(
      screen.getByText(/be specific about your target audience/i)
    ).toBeInTheDocument();
  });

  it('handles field blur events correctly', async () => {
    const user = userEvent.setup();
    render(<InputForm {...defaultProps} />);

    const websiteNameInput = screen.getByLabelText(/website name/i);

    // Focus and blur without entering data
    await user.click(websiteNameInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/website name is required/i)).toBeInTheDocument();
    });
  });

  it('sanitizes input correctly', async () => {
    const user = userEvent.setup();
    render(<InputForm {...defaultProps} />);

    // Enter data with HTML tags
    await user.type(
      screen.getByLabelText(/website name/i),
      '<script>alert("xss")</script>My Site'
    );
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'About my site with <div>HTML</div> content that is long enough'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        websiteName: 'My Site',
        industry: 'saas',
        aboutInfo: 'About my site with HTML content that is long enough',
        additionalRequirements: '',
      });
    });
  });

  it('prevents multiple submissions when already submitting', async () => {
    const user = userEvent.setup();
    const slowOnSubmit = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<InputForm onSubmit={slowOnSubmit} isLoading={false} />);

    // Fill in valid data
    await user.type(screen.getByLabelText(/website name/i), 'My Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'This is a detailed description of my website'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });

    // Click submit multiple times quickly
    await user.click(submitButton);
    await user.click(submitButton);
    await user.click(submitButton);

    // Should only be called once
    expect(slowOnSubmit).toHaveBeenCalledTimes(1);
  });
});
