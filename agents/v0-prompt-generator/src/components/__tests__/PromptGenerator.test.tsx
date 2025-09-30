import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptGenerator from '../PromptGenerator';
import { promptGenerationService } from '@/lib/prompt-generation-service';
import { GeneratedPrompt } from '@/types';

// Mock the prompt generation service
jest.mock('@/lib/prompt-generation-service', () => ({
  promptGenerationService: {
    generatePrompt: jest.fn(),
  },
}));

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

const mockPromptGenerationService = promptGenerationService as jest.Mocked<
  typeof promptGenerationService
>;

const mockGeneratedPrompt: GeneratedPrompt = {
  title: 'Test Website - SaaS Website',
  description: 'A modern SaaS website',
  context: 'Industry: SaaS\nPurpose: A test website for SaaS business',
  technicalSpecs: '- NextJS 14\n- TypeScript\n- Tailwind CSS',
  industryFeatures: ['Dashboard', 'User Management', 'Analytics'],
  fullPrompt: 'Complete V0 prompt content...',
  explanation: {
    sections: {
      description: 'AI-enhanced description',
      context: 'Enriched context',
      technicalSpecs: 'Technical requirements',
      features: 'Industry-specific features',
    },
    reasoning: 'Generated using AI enhancement',
  },
};

describe('PromptGenerator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPromptGenerationService.generatePrompt.mockResolvedValue(
      mockGeneratedPrompt
    );
  });

  it('renders the initial input form', () => {
    render(<PromptGenerator />);

    expect(screen.getByText('V0 Prompt Generator')).toBeInTheDocument();
    expect(
      screen.getByText(/Transform your website idea into a perfect V0 prompt/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/website name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/about your website/i)).toBeInTheDocument();
  });

  it('shows generation engine when form is submitted', async () => {
    const user = userEvent.setup();
    render(<PromptGenerator />);

    // Fill out the form
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application for project management'
    );

    // Submit the form
    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    // Should show generation engine
    await waitFor(() => {
      expect(screen.getByText('Generating Your V0 Prompt')).toBeInTheDocument();
    });
  });

  it('shows output display when generation completes', async () => {
    const user = userEvent.setup();
    render(<PromptGenerator />);

    // Fill out and submit form
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application for project management'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    // Wait for generation to complete
    await waitFor(
      () => {
        expect(screen.getByText('Generated V0 Prompt')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(
      screen.getByText('Your optimized prompt for Test Website')
    ).toBeInTheDocument();
    expect(mockPromptGenerationService.generatePrompt).toHaveBeenCalledWith({
      websiteName: 'Test Website',
      industry: 'saas',
      aboutInfo: 'A test SaaS application for project management',
      additionalRequirements: '',
    });
  });

  it('handles generation errors gracefully', async () => {
    const user = userEvent.setup();
    const errorMessage = 'AI service unavailable';
    mockPromptGenerationService.generatePrompt.mockRejectedValue(
      new Error(errorMessage)
    );

    render(<PromptGenerator />);

    // Fill out and submit form
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application for project management'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    // Wait for error to appear
    await waitFor(
      () => {
        expect(screen.getByText('Generation Failed')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('allows starting over from error state', async () => {
    const user = userEvent.setup();
    mockPromptGenerationService.generatePrompt.mockRejectedValue(
      new Error('Test error')
    );

    render(<PromptGenerator />);

    // Fill out and submit form
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    });

    // Click start over
    const startOverButton = screen.getByText('Start Over');
    await user.click(startOverButton);

    // Should return to input form
    await waitFor(() => {
      expect(screen.getByLabelText(/website name/i)).toBeInTheDocument();
    });

    // Form should be reset
    expect(screen.getByLabelText(/website name/i)).toHaveValue('');
  });

  it('allows starting over from success state', async () => {
    const user = userEvent.setup();
    render(<PromptGenerator />);

    // Complete the flow to success
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Generated V0 Prompt')).toBeInTheDocument();
    });

    // Click start over
    const startOverButton = screen.getByText('Start Over');
    await user.click(startOverButton);

    // Should return to input form
    await waitFor(() => {
      expect(screen.getByLabelText(/website name/i)).toBeInTheDocument();
    });
  });

  it('handles prompt editing', async () => {
    const user = userEvent.setup();
    render(<PromptGenerator />);

    // Complete the flow to success
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Generated V0 Prompt')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit prompt/i });
    await user.click(editButton);

    // Should show textarea
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockGeneratedPrompt.fullPrompt);

    // Edit the content
    await user.clear(textarea);
    await user.type(textarea, 'Edited prompt content');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Should update the displayed content
    expect(screen.getByText(/Edited prompt content/)).toBeInTheDocument();
  });

  it('handles copy functionality', async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<PromptGenerator />);

    // Complete the flow to success
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Generated V0 Prompt')).toBeInTheDocument();
    });

    // Click copy button
    const copyButton = screen.getByRole('button', { name: /copy prompt/i });
    await user.click(copyButton);

    // Should show success feedback
    await waitFor(() => {
      expect(
        screen.getByText('Prompt copied to clipboard!')
      ).toBeInTheDocument();
    });
  });

  it('preserves form data when returning from error', async () => {
    const user = userEvent.setup();
    mockPromptGenerationService.generatePrompt.mockRejectedValue(
      new Error('Test error')
    );

    render(<PromptGenerator />);

    // Fill out form
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    });

    // Click start over
    const startOverButton = screen.getByText('Start Over');
    await user.click(startOverButton);

    // Form should preserve the data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Website')).toBeInTheDocument();
      expect(screen.getByDisplayValue('saas')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('A test SaaS application')
      ).toBeInTheDocument();
    });
  });

  it('shows progress during generation', async () => {
    const user = userEvent.setup();
    render(<PromptGenerator />);

    // Fill out and submit form
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    // Should show progress indicators
    await waitFor(() => {
      expect(screen.getByText('Validating input data')).toBeInTheDocument();
      expect(screen.getByText('Loading industry context')).toBeInTheDocument();
      expect(screen.getByText('Processing with AI')).toBeInTheDocument();
    });
  });

  it('handles additional requirements field', async () => {
    const user = userEvent.setup();
    render(<PromptGenerator />);

    // Fill out form including additional requirements
    await user.type(screen.getByLabelText(/website name/i), 'Test Website');
    await user.selectOptions(screen.getByLabelText(/industry/i), 'saas');
    await user.type(
      screen.getByLabelText(/about your website/i),
      'A test SaaS application'
    );
    await user.type(
      screen.getByLabelText(/additional requirements/i),
      'Modern design with dark mode'
    );

    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPromptGenerationService.generatePrompt).toHaveBeenCalledWith({
        websiteName: 'Test Website',
        industry: 'saas',
        aboutInfo: 'A test SaaS application',
        additionalRequirements: 'Modern design with dark mode',
      });
    });
  });

  it('shows helpful tips and examples', () => {
    render(<PromptGenerator />);

    expect(screen.getByText(/Tips for better results/i)).toBeInTheDocument();
    expect(
      screen.getByText(/be specific about your target audience/i)
    ).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<PromptGenerator />);

    // Check for proper headings
    expect(
      screen.getByRole('heading', { name: /V0 Prompt Generator/i })
    ).toBeInTheDocument();

    // Check for form labels
    expect(screen.getByLabelText(/website name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/about your website/i)).toBeInTheDocument();

    // Check for button accessibility
    const submitButton = screen.getByRole('button', {
      name: /generate v0 prompt/i,
    });
    expect(submitButton).toBeInTheDocument();
  });
});
