import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExampleGallery } from '../ExampleGallery';

// Mock the data imports
jest.mock('@/data/example-prompts', () => ({
  EXAMPLE_PROMPTS: [
    {
      id: 'test-example',
      title: 'Test Example',
      industry: 'saas',
      description: 'A test example',
      fullPrompt: 'Test prompt content',
      tags: ['test'],
      difficulty: 'beginner',
      features: ['Test Feature'],
      explanation: {
        why: 'Test explanation',
        keyElements: ['Element 1'],
        tips: ['Tip 1'],
      },
    },
  ],
  PROMPT_TEMPLATES: [
    {
      id: 'test-template',
      name: 'Test Template',
      industry: 'saas',
      description: 'A test template',
      template: 'Test template content',
      placeholders: { test: 'Test placeholder' },
      instructions: ['Test instruction'],
      examples: [
        {
          websiteName: 'Test Site',
          aboutInfo: 'Test about',
          result: 'Test result',
        },
      ],
    },
  ],
  INTERACTIVE_EXAMPLES: [
    {
      id: 'test-interactive',
      title: 'Test Interactive',
      description: 'A test interactive example',
      initialInput: {
        websiteName: 'Test',
        industry: 'saas',
        aboutInfo: 'Test about',
      },
      expectedOutput: 'Test output',
      modifications: [],
    },
  ],
}));

jest.mock('@/lib/industry-config', () => ({
  INDUSTRY_CONFIGS: {
    saas: {
      displayName: 'SaaS',
    },
  },
}));

describe('ExampleGallery', () => {
  it('renders the gallery with tabs', () => {
    render(<ExampleGallery />);

    expect(screen.getByText('Example Gallery & Templates')).toBeInTheDocument();
    expect(screen.getByText('Example Prompts')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Interactive Examples')).toBeInTheDocument();
  });

  it('shows examples by default', () => {
    render(<ExampleGallery />);

    expect(screen.getByText('Test Example')).toBeInTheDocument();
    expect(screen.getByText('A test example')).toBeInTheDocument();
  });

  it('switches to templates tab', () => {
    render(<ExampleGallery />);

    fireEvent.click(screen.getByText('Templates'));
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('switches to interactive tab', () => {
    render(<ExampleGallery />);

    fireEvent.click(screen.getByText('Interactive Examples'));
    expect(screen.getByText('Test Interactive')).toBeInTheDocument();
  });

  it('calls onSelectExample when example is selected', () => {
    const mockOnSelect = jest.fn();
    render(<ExampleGallery onSelectExample={mockOnSelect} />);

    fireEvent.click(screen.getByText('Use This Prompt'));
    expect(mockOnSelect).toHaveBeenCalledWith('Test prompt content');
  });

  it('filters examples by search query', () => {
    render(<ExampleGallery />);

    const searchInput = screen.getByPlaceholderText(
      'Search examples, templates, or features...'
    );
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No examples found')).toBeInTheDocument();
  });
});
