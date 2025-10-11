# API Documentation

## Component API Reference

### Core Components

#### PromptGenerator

The main container component that orchestrates the entire prompt generation workflow.

```typescript
import { PromptGenerator } from '@/components/PromptGenerator';

function App() {
  return <PromptGenerator />;
}
```

**Props:** None (self-contained component)

**Features:**

- Manages global application state
- Handles user flow navigation
- Provides error boundaries
- Integrates all sub-components

---

#### InputForm

Collects and validates user input for prompt generation.

```typescript
import { InputForm } from '@/components/InputForm';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
  initialData?: Partial<UserInput>;
}

function MyComponent() {
  const handleSubmit = (data: UserInput) => {
    console.log('User input:', data);
  };

  return (
    <InputForm
      onSubmit={handleSubmit}
      isLoading={false}
      initialData={{ industry: 'SaaS' }}
    />
  );
}
```

**Props:**

- `onSubmit` (required): Callback function called when form is submitted
- `isLoading` (required): Boolean indicating if generation is in progress
- `initialData` (optional): Pre-populate form fields

**Events:**

- `onSubmit`: Fired when user submits valid form data

---

#### GenerationEngine

Handles AI processing and prompt construction using Alchemyst AI SDK.

```typescript
import { GenerationEngine } from '@/components/GenerationEngine';

interface GenerationEngineProps {
  userInput: UserInput;
  onGenerated: (prompt: GeneratedPrompt) => void;
  onError: (error: string) => void;
  onProgress?: (progress: number) => void;
}

function MyComponent() {
  const userInput = {
    websiteName: 'TechFlow',
    industry: 'SaaS',
    aboutInfo: 'Project management tool for teams'
  };

  const handleGenerated = (prompt: GeneratedPrompt) => {
    console.log('Generated prompt:', prompt);
  };

  const handleError = (error: string) => {
    console.error('Generation error:', error);
  };

  return (
    <GenerationEngine
      userInput={userInput}
      onGenerated={handleGenerated}
      onError={handleError}
      onProgress={(progress) => console.log(`Progress: ${progress}%`)}
    />
  );
}
```

**Props:**

- `userInput` (required): User input data to process
- `onGenerated` (required): Callback for successful generation
- `onError` (required): Callback for error handling
- `onProgress` (optional): Progress updates during generation

---

#### OutputDisplay

Displays generated prompts with editing and copy functionality.

```typescript
import { OutputDisplay } from '@/components/OutputDisplay';

interface OutputDisplayProps {
  prompt: GeneratedPrompt;
  onEdit: (editedPrompt: string) => void;
  onCopy: () => void;
  readOnly?: boolean;
}

function MyComponent() {
  const prompt = {
    title: 'SaaS Project Management Tool',
    description: 'Modern project management platform...',
    fullPrompt: 'Create a modern SaaS project management...',
    // ... other prompt properties
  };

  return (
    <OutputDisplay
      prompt={prompt}
      onEdit={(edited) => console.log('Edited:', edited)}
      onCopy={() => console.log('Copied to clipboard')}
      readOnly={false}
    />
  );
}
```

**Props:**

- `prompt` (required): Generated prompt data to display
- `onEdit` (required): Callback when user edits the prompt
- `onCopy` (required): Callback when user copies the prompt
- `readOnly` (optional): Disable editing functionality

---

#### ExampleGallery

Displays sample prompts and templates for different industries.

```typescript
import { ExampleGallery } from '@/components/ExampleGallery';

interface ExampleGalleryProps {
  onSelectExample?: (example: ExamplePrompt) => void;
  industry?: string;
  showFilters?: boolean;
}

function MyComponent() {
  const handleSelectExample = (example: ExamplePrompt) => {
    console.log('Selected example:', example);
  };

  return (
    <ExampleGallery
      onSelectExample={handleSelectExample}
      industry="SaaS"
      showFilters={true}
    />
  );
}
```

**Props:**

- `onSelectExample` (optional): Callback when user selects an example
- `industry` (optional): Filter examples by industry
- `showFilters` (optional): Show/hide industry filter controls

## Utility Functions

### Validation Utils

```typescript
import { validateUserInput, validatePromptLength } from '@/utils/validation';

// Validate user input
const userInput = {
  websiteName: 'My Website',
  industry: 'SaaS',
  aboutInfo: 'Description here',
};

const validation = validateUserInput(userInput);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}

// Validate prompt length
const isValidLength = validatePromptLength('Your prompt text here');
```

### Industry Utils

```typescript
import {
  getIndustryConfig,
  getIndustryFeatures,
  getAllIndustries,
} from '@/utils/industry-utils';

// Get industry configuration
const saasConfig = getIndustryConfig('SaaS');
console.log('SaaS features:', saasConfig.commonFeatures);

// Get specific industry features
const features = getIndustryFeatures('E-commerce');

// Get all available industries
const industries = getAllIndustries();
```

### Formatting Utils

```typescript
import {
  formatPromptForV0,
  formatPromptSections,
  truncateText,
} from '@/utils/formatting';

// Format prompt for V0 compatibility
const v0Prompt = formatPromptForV0(generatedPrompt);

// Format individual sections
const sections = formatPromptSections(prompt);

// Truncate text with ellipsis
const truncated = truncateText('Long text here...', 100);
```

## Data Types

### UserInput

```typescript
interface UserInput {
  websiteName: string; // Name of the website
  industry: string; // Selected industry
  aboutInfo: string; // Description of the website
  additionalRequirements?: string; // Optional extra requirements
}
```

### GeneratedPrompt

```typescript
interface GeneratedPrompt {
  title: string; // Generated title
  description: string; // Website description
  context: string; // Industry context
  technicalSpecs: string; // Technical requirements
  industryFeatures: string[]; // Industry-specific features
  fullPrompt: string; // Complete V0-ready prompt
  explanation: PromptExplanation; // Why elements were included
}
```

### PromptExplanation

```typescript
interface PromptExplanation {
  sections: {
    [key: string]: {
      content: string;
      reasoning: string;
    };
  };
  industryContext: string;
  technicalChoices: string[];
}
```

### IndustryConfig

```typescript
interface IndustryConfig {
  name: string;
  commonFeatures: string[];
  technicalRequirements: string[];
  designPatterns: string[];
  examplePrompts: string[];
}
```

## Service APIs

### AI Client Service

```typescript
import { aiClient } from '@/lib/ai-client';

// Generate prompt using AI
const result = await aiClient.generatePrompt({
  userInput,
  industryContext,
  templateStructure,
});

// Check API health
const isHealthy = await aiClient.healthCheck();
```

### Prompt Generation Service

```typescript
import { promptGenerationService } from '@/lib/prompt-generation-service';

// Generate complete prompt
const prompt = await promptGenerationService.generatePrompt(userInput);

// Generate with custom options
const customPrompt = await promptGenerationService.generatePrompt(userInput, {
  includeExamples: true,
  optimizeForV0: true,
  industryFocus: 'high',
});
```

### Cache Manager

```typescript
import { cacheManager } from '@/lib/cache-manager';

// Cache a prompt
cacheManager.setPrompt('cache-key', generatedPrompt);

// Retrieve cached prompt
const cached = cacheManager.getPrompt('cache-key');

// Clear cache
cacheManager.clear();
```

## Error Handling

### Error Types

```typescript
// API Errors
interface AIGenerationError {
  type: 'AI_GENERATION_ERROR';
  message: string;
  code: string;
  retryable: boolean;
}

// Validation Errors
interface ValidationError {
  type: 'VALIDATION_ERROR';
  field: string;
  message: string;
}

// Network Errors
interface NetworkError {
  type: 'NETWORK_ERROR';
  message: string;
  status?: number;
}
```

### Error Handling Hook

```typescript
import { useErrorHandling } from '@/hooks/useErrorHandling';

function MyComponent() {
  const { handleError, clearError, error } = useErrorHandling();

  const handleSubmit = async (data: UserInput) => {
    try {
      const result = await generatePrompt(data);
    } catch (err) {
      handleError(err);
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>Component content</div>;
}
```

## Performance Monitoring

### Performance Hook

```typescript
import { usePerformanceInit } from '@/hooks/usePerformanceInit';

function App() {
  const { metrics, startTiming, endTiming } = usePerformanceInit();

  const handleGeneration = async () => {
    startTiming('prompt-generation');
    await generatePrompt(userInput);
    endTiming('prompt-generation');
  };

  return (
    <div>
      <div>Generation time: {metrics['prompt-generation']}ms</div>
      {/* App content */}
    </div>
  );
}
```

### Performance Dashboard

```typescript
import { PerformanceDashboard } from '@/components/PerformanceDashboard';

function AdminPanel() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <PerformanceDashboard />
    </div>
  );
}
```

## Testing Utilities

### Test Helpers

```typescript
import {
  createMockUserInput,
  createMockGeneratedPrompt,
  mockAIClient,
} from '@/utils/test-helpers';

// Create mock data for testing
const mockInput = createMockUserInput({
  industry: 'SaaS',
  websiteName: 'Test App',
});

const mockPrompt = createMockGeneratedPrompt();

// Mock AI client for testing
mockAIClient.generatePrompt.mockResolvedValue(mockPrompt);
```

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { InputForm } from '@/components/InputForm';

test('InputForm submits valid data', async () => {
  const mockSubmit = jest.fn();

  render(<InputForm onSubmit={mockSubmit} isLoading={false} />);

  fireEvent.change(screen.getByLabelText(/website name/i), {
    target: { value: 'Test Website' }
  });

  fireEvent.click(screen.getByRole('button', { name: /generate/i }));

  expect(mockSubmit).toHaveBeenCalledWith({
    websiteName: 'Test Website',
    // ... other expected data
  });
});
```

## Configuration

### Environment Configuration

```typescript
// config/environment.ts
export const config = {
  alchemyst: {
    apiKey: process.env.ALCHEMYST_API_KEY!,
    baseUrl: process.env.ALCHEMYST_BASE_URL || 'https://api.getalchemystai.com',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'V0 Prompt Generator',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  performance: {
    monitoring:
      process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
  },
};
```

### Industry Configuration

```typescript
// Add custom industry
import { addIndustryConfig } from '@/lib/industry-config';

addIndustryConfig({
  name: 'Custom Industry',
  commonFeatures: ['feature1', 'feature2'],
  technicalRequirements: ['Next.js', 'TypeScript'],
  designPatterns: ['modern', 'responsive'],
  examplePrompts: ['Example prompt text...'],
});
```

## Migration Guide

### From v0.x to v1.x

1. **Component Props Changes**

   ```typescript
   // Old
   <InputForm onSubmit={handleSubmit} loading={true} />

   // New
   <InputForm onSubmit={handleSubmit} isLoading={true} />
   ```

2. **Import Path Changes**

   ```typescript
   // Old
   import { validateInput } from '@/utils';

   // New
   import { validateUserInput } from '@/utils/validation';
   ```

3. **Type Changes**

   ```typescript
   // Old
   interface UserData {
     name: string;
     type: string;
     description: string;
   }

   // New
   interface UserInput {
     websiteName: string;
     industry: string;
     aboutInfo: string;
   }
   ```
