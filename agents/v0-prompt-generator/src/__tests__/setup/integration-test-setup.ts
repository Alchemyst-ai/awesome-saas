/**
 * Integration Test Setup
 *
 * This file contains setup utilities and mocks for integration tests.
 * It ensures consistent test environment across all integration test suites.
 */

import '@testing-library/jest-dom';

// Global test environment setup
beforeAll(() => {
  // Mock environment variables
  process.env.ALCHEMYST_AI_API_KEY = 'test-api-key';
  process.env.ALCHEMYST_AI_BASE_URL = 'https://api.test.alchemyst.ai';
  process.env.NODE_ENV = 'test';

  // Mock console methods to reduce noise in tests
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});

  // Mock window.matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
      readText: jest.fn().mockResolvedValue(''),
    },
  });

  // Mock fetch for any HTTP requests
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
  });
});

afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Common test utilities
export const createMockUserInput = (overrides = {}) => ({
  websiteName: 'Test Website',
  industry: 'saas',
  aboutInfo: 'A test website for integration testing',
  additionalRequirements: 'Modern design and responsive layout',
  ...overrides,
});

export const createMockGeneratedPrompt = (
  userInput = createMockUserInput()
) => ({
  title: `${userInput.websiteName} - Professional Website`,
  description: `Create a modern, professional website for ${userInput.websiteName}. ${userInput.aboutInfo}`,
  context: `Industry: ${userInput.industry}\nPurpose: ${userInput.aboutInfo}\nTarget Audience: Professional users`,
  technicalSpecs:
    '- NextJS 14 with App Router\n- TypeScript for type safety\n- Tailwind CSS for styling',
  industryFeatures: [
    'Modern Design',
    'Responsive Layout',
    'SEO Optimization',
    'Performance Optimized',
  ],
  fullPrompt: `# ${userInput.websiteName} - Professional Website

## Description
Create a modern, professional website for ${userInput.websiteName}. ${userInput.aboutInfo}

## Context
Industry: ${userInput.industry}
Purpose: ${userInput.aboutInfo}
Target Audience: Professional users

## Technical Requirements
- NextJS 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling

## Key Features
- Modern Design
- Responsive Layout
- SEO Optimization
- Performance Optimized

## Design Guidelines
- Follow modern web design principles
- Use clean, professional UI/UX
- Ensure accessibility compliance (WCAG 2.1 AA)
- Optimize for performance and SEO

## Implementation Notes
- Use NextJS 14 with App Router for optimal performance
- Implement TypeScript for type safety
- Use Tailwind CSS for consistent styling
- Follow component-based architecture
- Include proper error handling and loading states`,
  explanation: {
    sections: {
      description: 'Professional description based on user input',
      context: 'Industry-specific context and target audience',
      technicalSpecs: 'Modern technical requirements',
      features: 'Essential features for the industry',
    },
    reasoning:
      'Generated using industry best practices and modern web development standards.',
  },
});

// Mock error scenarios
export const createMockApiError = (
  message: string,
  code: string,
  statusCode = 500
) => {
  const error = new Error(message) as any;
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

// Test data for different industries
export const industryTestData = {
  saas: {
    websiteName: 'CloudFlow Pro',
    industry: 'saas',
    aboutInfo:
      'A comprehensive project management and team collaboration platform',
    additionalRequirements: 'User dashboard, admin panel, billing integration',
    expectedFeatures: ['User Dashboard', 'Team Collaboration', 'Analytics'],
    expectedTech: ['NextJS', 'TypeScript', 'Authentication'],
  },
  ecommerce: {
    websiteName: 'TechGear Store',
    industry: 'ecommerce',
    aboutInfo: 'An online electronics and gadgets store',
    additionalRequirements:
      'Shopping cart, payment processing, product reviews',
    expectedFeatures: [
      'Product Catalog',
      'Shopping Cart',
      'Payment Processing',
    ],
    expectedTech: ['NextJS', 'E-commerce Integration', 'Payment Gateway'],
  },
  portfolio: {
    websiteName: 'Sarah Chen Design',
    industry: 'portfolio',
    aboutInfo: 'A creative portfolio showcasing UI/UX design work',
    additionalRequirements: 'Image gallery, contact form, blog section',
    expectedFeatures: ['Portfolio Gallery', 'Contact Form', 'Blog'],
    expectedTech: ['NextJS', 'Image Optimization', 'CMS Integration'],
  },
  corporate: {
    websiteName: 'Acme Corporation',
    industry: 'corporate',
    aboutInfo: 'A professional corporate website for a consulting firm',
    additionalRequirements: 'Team profiles, case studies, contact forms',
    expectedFeatures: ['Team Profiles', 'Case Studies', 'Contact Forms'],
    expectedTech: ['NextJS', 'CMS Integration', 'SEO Optimization'],
  },
  startup: {
    websiteName: 'InnovateTech',
    industry: 'startup',
    aboutInfo: 'A cutting-edge startup in the AI and machine learning space',
    additionalRequirements: 'Product showcase, investor information, team bios',
    expectedFeatures: ['Product Showcase', 'Investor Info', 'Team Bios'],
    expectedTech: ['NextJS', 'Modern Design', 'Performance Optimization'],
  },
  agency: {
    websiteName: 'Creative Studio',
    industry: 'agency',
    aboutInfo:
      'A full-service creative agency specializing in branding and digital marketing',
    additionalRequirements:
      'Portfolio showcase, client testimonials, service pages',
    expectedFeatures: [
      'Portfolio Showcase',
      'Client Testimonials',
      'Service Pages',
    ],
    expectedTech: ['NextJS', 'Creative Design', 'Portfolio Management'],
  },
};

// Performance testing utilities
export const measurePerformance = async (operation: () => Promise<any>) => {
  const startTime = performance.now();
  const result = await operation();
  const endTime = performance.now();
  return {
    result,
    duration: endTime - startTime,
  };
};

// Accessibility testing utilities
export const checkAccessibility = (container: HTMLElement) => {
  // Check for basic accessibility attributes
  const buttons = container.querySelectorAll('button');
  const inputs = container.querySelectorAll('input, textarea, select');
  const images = container.querySelectorAll('img');

  const issues: string[] = [];

  // Check buttons have accessible names
  buttons.forEach((button, index) => {
    if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
      issues.push(`Button ${index} lacks accessible name`);
    }
  });

  // Check form inputs have labels
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const hasLabel = id && container.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label');

    if (!hasLabel && !hasAriaLabel) {
      issues.push(`Input ${index} lacks proper label`);
    }
  });

  // Check images have alt text
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push(`Image ${index} lacks alt text`);
    }
  });

  return {
    isAccessible: issues.length === 0,
    issues,
  };
};

// Network simulation utilities
export const simulateNetworkConditions = {
  slow: () => {
    jest.useFakeTimers();
    // Simulate slow network by adding delays
    return {
      cleanup: () => jest.useRealTimers(),
    };
  },
  offline: () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    return {
      cleanup: () => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true,
        });
      },
    };
  },
  unstable: () => {
    let callCount = 0;
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount % 3 === 0) {
        return Promise.reject(new Error('Network error'));
      }
      return originalFetch();
    });

    return {
      cleanup: () => {
        global.fetch = originalFetch;
      },
    };
  },
};

export default {
  createMockUserInput,
  createMockGeneratedPrompt,
  createMockApiError,
  industryTestData,
  measurePerformance,
  checkAccessibility,
  simulateNetworkConditions,
};
