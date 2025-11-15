import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GenerationEngine from '../GenerationEngine';

// Mock the prompt generation service
jest.mock('@/lib/prompt-generation-service', () => ({
  promptGenerationService: {
    generatePrompt: jest.fn(),
  },
}));

// Simple integration test to verify the component exports and renders
describe('GenerationEngine Integration', () => {
  const mockUserInput = {
    websiteName: 'Test Website',
    industry: 'saas',
    aboutInfo: 'A test website for SaaS business',
    additionalRequirements: 'Modern design',
  };

  const mockOnGenerated = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('component exports correctly and can be rendered', () => {
    expect(GenerationEngine).toBeDefined();
    expect(typeof GenerationEngine).toBe('function');

    const { container } = render(
      <GenerationEngine
        userInput={mockUserInput}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    // Component should render without crashing
    expect(container).toBeDefined();
  });

  it('renders null when no userInput provided', () => {
    const { container } = render(
      <GenerationEngine
        userInput={null as any}
        onGenerated={mockOnGenerated}
        onError={mockOnError}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('accepts all required props without TypeScript errors', () => {
    // This test verifies the component interface is correct
    const props = {
      userInput: mockUserInput,
      onGenerated: mockOnGenerated,
      onError: mockOnError,
      onProgress: jest.fn(),
    };

    expect(() => {
      render(<GenerationEngine {...props} />);
    }).not.toThrow();
  });
});
