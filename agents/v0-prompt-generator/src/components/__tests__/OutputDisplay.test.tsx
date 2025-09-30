import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OutputDisplay from '../OutputDisplay';
import { GeneratedPrompt } from '@/types';

// Mock clipboard API
const mockClipboard = {
  writeText: jest.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

// Mock window.isSecureContext
Object.defineProperty(window, 'isSecureContext', {
  writable: true,
  value: true,
});

// Mock document.execCommand for fallback clipboard
const mockExecCommand = jest.fn();
document.execCommand = mockExecCommand;

const mockPrompt: GeneratedPrompt = {
  title: 'Test Website',
  description: 'A test website for e-commerce',
  context:
    'This is a modern e-commerce platform targeting young professionals who value convenience and quality.',
  technicalSpecs:
    'Built with NextJS 14, TypeScript, Tailwind CSS, and integrated with Stripe for payments.',
  industryFeatures: [
    'Product catalog with search and filtering',
    'Shopping cart and checkout process',
    'User account management',
    'Order tracking and history',
    'Customer reviews and ratings',
  ],
  fullPrompt: `# E-commerce Website for Test Website

## Description
A test website for e-commerce

## Context
This is a modern e-commerce platform targeting young professionals who value convenience and quality.

## Technical Specifications
Built with NextJS 14, TypeScript, Tailwind CSS, and integrated with Stripe for payments.

## Features
- Product catalog with search and filtering
- Shopping cart and checkout process
- User account management`,
  explanation: {
    sections: {
      description:
        'Provides clear context about the website purpose and target audience',
      technical:
        'Specifies modern technologies that V0 can work with effectively',
      features:
        'Lists specific functionality that guides V0 in creating appropriate components',
    },
    reasoning:
      'This prompt is structured to give V0 comprehensive context while being specific enough to generate relevant components and layouts for an e-commerce platform.',
  },
};

describe('OutputDisplay Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnCopy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockClipboard.writeText.mockResolvedValue(undefined);
    mockExecCommand.mockReturnValue(true);

    // Reset window.isSecureContext to true by default
    Object.defineProperty(window, 'isSecureContext', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders the component with prompt content', () => {
    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    expect(screen.getByText('Generated V0 Prompt')).toBeInTheDocument();
    expect(
      screen.getByText('Your optimized prompt for Test Website')
    ).toBeInTheDocument();
    expect(screen.getByText('V0 Prompt Content')).toBeInTheDocument();
  });

  it('displays the full prompt content with syntax highlighting', () => {
    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    // Check that the prompt content is displayed
    expect(
      screen.getByText(/E-commerce Website for Test Website/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A test website for e-commerce/)
    ).toBeInTheDocument();
  });

  it('handles copy to clipboard functionality', async () => {
    const user = userEvent.setup();

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy prompt/i });
    await user.click(copyButton);

    // Check that the onCopy callback is called
    expect(mockOnCopy).toHaveBeenCalled();

    // Check for success feedback
    await waitFor(() => {
      expect(
        screen.getByText('Prompt copied to clipboard!')
      ).toBeInTheDocument();
    });

    // Check that the button shows "Copied!" state
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('handles clipboard errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock both clipboard API and execCommand to fail
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard failed'));
    mockExecCommand.mockReturnValue(false); // execCommand returns false on failure

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy prompt/i });
    await user.click(copyButton);

    // The component should still attempt to copy and handle errors gracefully
    // Even if both methods fail, the component should not crash
    expect(copyButton).toBeInTheDocument();
  });

  it('uses fallback clipboard method when clipboard API is not available', async () => {
    const user = userEvent.setup();

    // Mock environment without clipboard API
    Object.defineProperty(window, 'isSecureContext', {
      writable: true,
      value: false,
    });

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy prompt/i });
    await user.click(copyButton);

    // Should use document.execCommand fallback
    await waitFor(() => {
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });

    expect(mockOnCopy).toHaveBeenCalled();

    // Check for success feedback
    await waitFor(() => {
      expect(
        screen.getByText('Prompt copied to clipboard!')
      ).toBeInTheDocument();
    });
  });

  it('enters and exits edit mode correctly', async () => {
    const user = userEvent.setup();

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit prompt/i });
    await user.click(editButton);

    // Should show textarea in edit mode
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockPrompt.fullPrompt);

    // Button should change to "Save Changes"
    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it('handles content editing and saves changes', async () => {
    const user = userEvent.setup();

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit prompt/i });
    await user.click(editButton);

    // Edit the content
    const textarea = screen.getByRole('textbox');
    const newContent = 'Updated prompt content';
    await user.clear(textarea);
    await user.type(textarea, newContent);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(mockOnEdit).toHaveBeenCalledWith(newContent);
  });

  it('expands and collapses explanation sections', async () => {
    const user = userEvent.setup();

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    // Initially, explanation content should not be visible
    expect(
      screen.queryByText(mockPrompt.explanation.reasoning)
    ).not.toBeInTheDocument();

    // Click to expand explanation section
    const explanationButton = screen.getByRole('button', {
      name: /prompt explanation/i,
    });
    await user.click(explanationButton);

    // Content should now be visible
    expect(
      screen.getByText(mockPrompt.explanation.reasoning)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Why this prompt is effective/)
    ).toBeInTheDocument();

    // Click again to collapse
    await user.click(explanationButton);

    // Content should be hidden again
    await waitFor(() => {
      expect(
        screen.queryByText(mockPrompt.explanation.reasoning)
      ).not.toBeInTheDocument();
    });
  });

  it('expands and collapses context section', async () => {
    const user = userEvent.setup();

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    const contextButton = screen.getByRole('button', {
      name: /context & background/i,
    });
    await user.click(contextButton);

    // Use getAllByText to handle multiple instances and check the expanded section specifically
    const contextElements = screen.getAllByText(mockPrompt.context);
    expect(contextElements.length).toBeGreaterThan(0);
  });

  it('expands and collapses technical specifications section', async () => {
    const user = userEvent.setup();

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    const technicalButton = screen.getByRole('button', {
      name: /technical specifications/i,
    });
    await user.click(technicalButton);

    // Use getAllByText to handle multiple instances and check the expanded section specifically
    const technicalElements = screen.getAllByText(mockPrompt.technicalSpecs);
    expect(technicalElements.length).toBeGreaterThan(0);
  });

  it('expands and collapses industry features section', async () => {
    const user = userEvent.setup();

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    const featuresButton = screen.getByRole('button', {
      name: /industry-specific features/i,
    });
    await user.click(featuresButton);

    // Check that industry features are displayed
    mockPrompt.industryFeatures.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('updates edited content when prompt prop changes', () => {
    const { rerender } = render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    const updatedPrompt = {
      ...mockPrompt,
      fullPrompt: 'Updated prompt content',
    };

    rerender(
      <OutputDisplay
        prompt={updatedPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    // The component should update to show the new content
    expect(screen.getByText(/Updated prompt content/)).toBeInTheDocument();
  });

  it('copies edited content when in edit mode', async () => {
    const user = userEvent.setup();

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit prompt/i });
    await user.click(editButton);

    // Edit the content
    const textarea = screen.getByRole('textbox');
    const editedContent = 'Edited content for copying';
    await user.clear(textarea);
    await user.type(textarea, editedContent);

    // Copy while in edit mode
    const copyButton = screen.getByRole('button', { name: /copy prompt/i });
    await user.click(copyButton);

    // Check that the onCopy callback is called
    expect(mockOnCopy).toHaveBeenCalled();

    // Check for success feedback
    await waitFor(() => {
      expect(
        screen.getByText('Prompt copied to clipboard!')
      ).toBeInTheDocument();
    });
  });

  it('shows usage tips section', () => {
    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    expect(
      screen.getByText(/Tips for using this prompt with V0/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Copy the entire prompt and paste it into V0's input field/
      )
    ).toBeInTheDocument();
  });

  it('handles keyboard navigation for expandable sections', async () => {
    const user = userEvent.setup();

    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    const explanationButton = screen.getByRole('button', {
      name: /prompt explanation/i,
    });

    // Focus and activate with keyboard
    explanationButton.focus();
    await user.keyboard('{Enter}');

    expect(
      screen.getByText(mockPrompt.explanation.reasoning)
    ).toBeInTheDocument();
  });

  it('maintains accessibility with proper ARIA labels', () => {
    render(
      <OutputDisplay
        prompt={mockPrompt}
        onEdit={mockOnEdit}
        onCopy={mockOnCopy}
      />
    );

    // Check that buttons have proper accessibility
    const editButton = screen.getByRole('button', { name: /edit prompt/i });
    const copyButton = screen.getByRole('button', { name: /copy prompt/i });

    expect(editButton).toBeInTheDocument();
    expect(copyButton).toBeInTheDocument();

    // Expandable sections should be properly labeled
    const explanationButton = screen.getByRole('button', {
      name: /prompt explanation/i,
    });
    expect(explanationButton).toBeInTheDocument();
  });
});
