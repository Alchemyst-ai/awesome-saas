# Component Usage Examples

## Complete Usage Examples

### Basic Implementation

Here's a complete example of implementing the V0 Prompt Generator in your application:

```typescript
// app/page.tsx
import { PromptGenerator } from '@/components/PromptGenerator';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          V0 Prompt Generator
        </h1>
        <PromptGenerator />
      </div>
    </main>
  );
}
```

### Custom Implementation with State Management

```typescript
// components/CustomPromptGenerator.tsx
import { useState } from 'react';
import { InputForm } from '@/components/InputForm';
import { GenerationEngine } from '@/components/GenerationEngine';
import { OutputDisplay } from '@/components/OutputDisplay';
import { ExampleGallery } from '@/components/ExampleGallery';
import type { UserInput, GeneratedPrompt } from '@/types';

export function CustomPromptGenerator() {
  const [step, setStep] = useState<'input' | 'generating' | 'output'>('input');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputSubmit = (data: UserInput) => {
    setUserInput(data);
    setStep('generating');
    setError(null);
  };

  const handlePromptGenerated = (prompt: GeneratedPrompt) => {
    setGeneratedPrompt(prompt);
    setStep('output');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setStep('input');
  };

  const handleStartOver = () => {
    setStep('input');
    setUserInput(null);
    setGeneratedPrompt(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'input' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <div className="w-16 h-1 bg-gray-200">
            <div className={`h-full bg-blue-500 transition-all ${
              step !== 'input' ? 'w-full' : 'w-0'
            }`} />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'generating' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <div className="w-16 h-1 bg-gray-200">
            <div className={`h-full bg-blue-500 transition-all ${
              step === 'output' ? 'w-full' : 'w-0'
            }`} />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'output' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Content */}
      {step === 'input' && (
        <div className="space-y-8">
          <InputForm
            onSubmit={handleInputSubmit}
            isLoading={false}
          />
          <ExampleGallery
            onSelectExample={(example) => {
              setUserInput({
                websiteName: example.websiteName,
                industry: example.industry,
                aboutInfo: example.aboutInfo
              });
            }}
          />
        </div>
      )}

      {step === 'generating' && userInput && (
        <GenerationEngine
          userInput={userInput}
          onGenerated={handlePromptGenerated}
          onError={handleError}
          onProgress={(progress) => console.log(`Progress: ${progress}%`)}
        />
      )}

      {step === 'output' && generatedPrompt && (
        <div className="space-y-6">
          <OutputDisplay
            prompt={generatedPrompt}
            onEdit={(edited) => {
              setGeneratedPrompt({
                ...generatedPrompt,
                fullPrompt: edited
              });
            }}
            onCopy={() => {
              navigator.clipboard.writeText(generatedPrompt.fullPrompt);
              // Show success message
            }}
          />
          <div className="flex justify-center">
            <button
              onClick={handleStartOver}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Generate Another Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Individual Component Examples

### InputForm Component

#### Basic Usage

```typescript
import { InputForm } from '@/components/InputForm';

function BasicInputExample() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UserInput) => {
    setIsLoading(true);
    try {
      // Process the input
      console.log('User input:', data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InputForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
```

#### With Pre-filled Data

```typescript
function PrefilledInputExample() {
  const initialData = {
    websiteName: 'TechFlow Solutions',
    industry: 'SaaS',
    aboutInfo: 'A project management tool for remote teams'
  };

  return (
    <InputForm
      onSubmit={(data) => console.log(data)}
      isLoading={false}
      initialData={initialData}
    />
  );
}
```

#### With Custom Validation

```typescript
import { validateUserInput } from '@/utils/validation';

function ValidatedInputExample() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (data: UserInput) => {
    const validation = validateUserInput(data);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    // Process valid input
  };

  return (
    <div>
      <InputForm
        onSubmit={handleSubmit}
        isLoading={false}
      />
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          {Object.entries(errors).map(([field, message]) => (
            <p key={field} className="text-red-700">
              {field}: {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### GenerationEngine Component

#### Basic Usage

```typescript
import { GenerationEngine } from '@/components/GenerationEngine';

function BasicGenerationExample() {
  const userInput = {
    websiteName: 'EcoStore',
    industry: 'E-commerce',
    aboutInfo: 'Sustainable products marketplace'
  };

  const handleGenerated = (prompt: GeneratedPrompt) => {
    console.log('Generated prompt:', prompt);
  };

  const handleError = (error: string) => {
    console.error('Generation failed:', error);
  };

  return (
    <GenerationEngine
      userInput={userInput}
      onGenerated={handleGenerated}
      onError={handleError}
    />
  );
}
```

#### With Progress Tracking

```typescript
function ProgressTrackingExample() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  const statusMessages = {
    0: 'Initializing...',
    25: 'Analyzing industry context...',
    50: 'Generating content...',
    75: 'Optimizing for V0...',
    100: 'Complete!'
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{status}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <GenerationEngine
        userInput={userInput}
        onGenerated={handleGenerated}
        onError={handleError}
        onProgress={(newProgress) => {
          setProgress(newProgress);
          setStatus(statusMessages[newProgress] || 'Processing...');
        }}
      />
    </div>
  );
}
```

### OutputDisplay Component

#### Basic Usage

```typescript
import { OutputDisplay } from '@/components/OutputDisplay';

function BasicOutputExample() {
  const [prompt, setPrompt] = useState<GeneratedPrompt>(samplePrompt);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleEdit = (editedPrompt: string) => {
    setPrompt({
      ...prompt,
      fullPrompt: editedPrompt
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.fullPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div>
      <OutputDisplay
        prompt={prompt}
        onEdit={handleEdit}
        onCopy={handleCopy}
      />
      {copySuccess && (
        <div className="mt-2 p-2 bg-green-100 text-green-700 rounded">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
```

#### Read-Only Mode

```typescript
function ReadOnlyOutputExample() {
  return (
    <OutputDisplay
      prompt={samplePrompt}
      onEdit={() => {}} // No-op for read-only
      onCopy={handleCopy}
      readOnly={true}
    />
  );
}
```

#### With Custom Actions

```typescript
function CustomActionsExample() {
  const [prompt, setPrompt] = useState<GeneratedPrompt>(samplePrompt);

  const handleSave = async () => {
    // Save to database or local storage
    localStorage.setItem('saved-prompt', JSON.stringify(prompt));
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: prompt.title,
        text: prompt.description,
        url: window.location.href
      });
    }
  };

  return (
    <div>
      <OutputDisplay
        prompt={prompt}
        onEdit={(edited) => setPrompt({ ...prompt, fullPrompt: edited })}
        onCopy={handleCopy}
      />

      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Prompt
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Share
        </button>
      </div>
    </div>
  );
}
```

### ExampleGallery Component

#### Basic Usage

```typescript
import { ExampleGallery } from '@/components/ExampleGallery';

function BasicGalleryExample() {
  const handleSelectExample = (example: ExamplePrompt) => {
    console.log('Selected example:', example);
    // Use the example to pre-fill form
  };

  return (
    <ExampleGallery
      onSelectExample={handleSelectExample}
    />
  );
}
```

#### Filtered by Industry

```typescript
function FilteredGalleryExample() {
  const [selectedIndustry, setSelectedIndustry] = useState('SaaS');

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Filter by Industry:
        </label>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Industries</option>
          <option value="SaaS">SaaS</option>
          <option value="E-commerce">E-commerce</option>
          <option value="Portfolio">Portfolio</option>
        </select>
      </div>

      <ExampleGallery
        industry={selectedIndustry}
        onSelectExample={handleSelectExample}
        showFilters={false} // We're handling filters ourselves
      />
    </div>
  );
}
```

## Advanced Usage Patterns

### Custom Hook for Prompt Generation

```typescript
// hooks/usePromptGeneration.ts
import { useState, useCallback } from 'react';
import { promptGenerationService } from '@/lib/prompt-generation-service';
import type { UserInput, GeneratedPrompt } from '@/types';

export function usePromptGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<GeneratedPrompt | null>(null);

  const generatePrompt = useCallback(async (userInput: UserInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await promptGenerationService.generatePrompt(userInput);
      setPrompt(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPrompt(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    generatePrompt,
    reset,
    isLoading,
    error,
    prompt
  };
}

// Usage
function MyComponent() {
  const { generatePrompt, isLoading, error, prompt } = usePromptGeneration();

  const handleSubmit = async (userInput: UserInput) => {
    try {
      await generatePrompt(userInput);
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  return (
    <div>
      <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
      {error && <div className="error">{error}</div>}
      {prompt && <OutputDisplay prompt={prompt} onEdit={() => {}} onCopy={() => {}} />}
    </div>
  );
}
```

### Context Provider Pattern

```typescript
// contexts/PromptGeneratorContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { UserInput, GeneratedPrompt } from '@/types';

interface PromptGeneratorState {
  step: 'input' | 'generating' | 'output';
  userInput: UserInput | null;
  prompt: GeneratedPrompt | null;
  error: string | null;
  isLoading: boolean;
}

type PromptGeneratorAction =
  | { type: 'SET_INPUT'; payload: UserInput }
  | { type: 'START_GENERATION' }
  | { type: 'SET_PROMPT'; payload: GeneratedPrompt }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: PromptGeneratorState = {
  step: 'input',
  userInput: null,
  prompt: null,
  error: null,
  isLoading: false
};

function promptGeneratorReducer(
  state: PromptGeneratorState,
  action: PromptGeneratorAction
): PromptGeneratorState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, userInput: action.payload, step: 'input' };
    case 'START_GENERATION':
      return { ...state, step: 'generating', isLoading: true, error: null };
    case 'SET_PROMPT':
      return { ...state, prompt: action.payload, step: 'output', isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, step: 'input', isLoading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const PromptGeneratorContext = createContext<{
  state: PromptGeneratorState;
  dispatch: React.Dispatch<PromptGeneratorAction>;
} | null>(null);

export function PromptGeneratorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(promptGeneratorReducer, initialState);

  return (
    <PromptGeneratorContext.Provider value={{ state, dispatch }}>
      {children}
    </PromptGeneratorContext.Provider>
  );
}

export function usePromptGeneratorContext() {
  const context = useContext(PromptGeneratorContext);
  if (!context) {
    throw new Error('usePromptGeneratorContext must be used within PromptGeneratorProvider');
  }
  return context;
}

// Usage
function App() {
  return (
    <PromptGeneratorProvider>
      <PromptGeneratorFlow />
    </PromptGeneratorProvider>
  );
}

function PromptGeneratorFlow() {
  const { state, dispatch } = usePromptGeneratorContext();

  const handleInputSubmit = (userInput: UserInput) => {
    dispatch({ type: 'SET_INPUT', payload: userInput });
    dispatch({ type: 'START_GENERATION' });
    // Trigger generation...
  };

  return (
    <div>
      {state.step === 'input' && (
        <InputForm onSubmit={handleInputSubmit} isLoading={state.isLoading} />
      )}
      {/* Other steps... */}
    </div>
  );
}
```

### Integration with Form Libraries

```typescript
// Using React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userInputSchema = z.object({
  websiteName: z.string().min(1, 'Website name is required'),
  industry: z.string().min(1, 'Industry is required'),
  aboutInfo: z.string().min(10, 'Please provide more details (at least 10 characters)')
});

function FormIntegrationExample() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserInput>({
    resolver: zodResolver(userInputSchema)
  });

  const onSubmit = async (data: UserInput) => {
    try {
      const prompt = await promptGenerationService.generatePrompt(data);
      console.log('Generated:', prompt);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Website Name
        </label>
        <input
          {...register('websiteName')}
          className="w-full border rounded px-3 py-2"
          placeholder="My Awesome Website"
        />
        {errors.websiteName && (
          <p className="text-red-500 text-sm mt-1">{errors.websiteName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Industry
        </label>
        <select {...register('industry')} className="w-full border rounded px-3 py-2">
          <option value="">Select an industry</option>
          <option value="SaaS">SaaS</option>
          <option value="E-commerce">E-commerce</option>
          <option value="Portfolio">Portfolio</option>
        </select>
        {errors.industry && (
          <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          About Your Website
        </label>
        <textarea
          {...register('aboutInfo')}
          className="w-full border rounded px-3 py-2"
          rows={4}
          placeholder="Describe what your website is about..."
        />
        {errors.aboutInfo && (
          <p className="text-red-500 text-sm mt-1">{errors.aboutInfo.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Generating...' : 'Generate Prompt'}
      </button>
    </form>
  );
}
```

## Testing Examples

### Component Testing

```typescript
// __tests__/InputForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InputForm } from '@/components/InputForm';

describe('InputForm', () => {
  it('submits form with valid data', async () => {
    const mockSubmit = jest.fn();

    render(<InputForm onSubmit={mockSubmit} isLoading={false} />);

    fireEvent.change(screen.getByLabelText(/website name/i), {
      target: { value: 'Test Website' }
    });

    fireEvent.change(screen.getByLabelText(/industry/i), {
      target: { value: 'SaaS' }
    });

    fireEvent.change(screen.getByLabelText(/about/i), {
      target: { value: 'This is a test website description' }
    });

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        websiteName: 'Test Website',
        industry: 'SaaS',
        aboutInfo: 'This is a test website description'
      });
    });
  });

  it('shows loading state', () => {
    render(<InputForm onSubmit={jest.fn()} isLoading={true} />);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
// __tests__/prompt-generation-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptGenerator } from '@/components/PromptGenerator';
import { promptGenerationService } from '@/lib/prompt-generation-service';

jest.mock('@/lib/prompt-generation-service');

describe('Prompt Generation Flow', () => {
  it('completes full generation workflow', async () => {
    const mockPrompt = {
      title: 'Test Prompt',
      description: 'Test description',
      fullPrompt: 'Complete test prompt...',
      // ... other properties
    };

    (promptGenerationService.generatePrompt as jest.Mock)
      .mockResolvedValue(mockPrompt);

    render(<PromptGenerator />);

    // Fill out form
    fireEvent.change(screen.getByLabelText(/website name/i), {
      target: { value: 'Test Site' }
    });

    fireEvent.change(screen.getByLabelText(/industry/i), {
      target: { value: 'SaaS' }
    });

    fireEvent.change(screen.getByLabelText(/about/i), {
      target: { value: 'A test SaaS application' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    // Wait for generation to complete
    await waitFor(() => {
      expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    });

    // Verify copy functionality
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    // Verify the service was called correctly
    expect(promptGenerationService.generatePrompt).toHaveBeenCalledWith({
      websiteName: 'Test Site',
      industry: 'SaaS',
      aboutInfo: 'A test SaaS application'
    });
  });
});
```
