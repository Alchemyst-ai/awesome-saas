// Form handling utilities for user input management

import { UserInput, ValidationError } from '@/types';
import {
  validateUserInput,
  validateField,
  sanitizeUserInput,
} from './validation';

/**
 * Form state interface for managing input and validation
 */
export interface FormState {
  values: UserInput;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: keyof UserInput;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'select';
  required: boolean;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
}

/**
 * Initial form state
 */
export const createInitialFormState = (
  initialValues?: Partial<UserInput>
): FormState => ({
  values: {
    websiteName: initialValues?.websiteName || '',
    industry: initialValues?.industry || '',
    aboutInfo: initialValues?.aboutInfo || '',
    additionalRequirements: initialValues?.additionalRequirements || '',
  },
  errors: {},
  touched: {},
  isSubmitting: false,
  isValid: false,
});

/**
 * Update form field value and validate
 */
export const updateFormField = (
  formState: FormState,
  fieldName: keyof UserInput,
  value: string
): FormState => {
  const newValues = {
    ...formState.values,
    [fieldName]: value,
  };

  // Validate the specific field
  const fieldErrors = validateField(fieldName, value);
  const newErrors = {
    ...formState.errors,
    [fieldName]: fieldErrors.map((error) => error.message),
  };

  // Remove empty error arrays
  if (newErrors[fieldName].length === 0) {
    delete newErrors[fieldName];
  }

  // Mark field as touched
  const newTouched = {
    ...formState.touched,
    [fieldName]: true,
  };

  // Check overall form validity
  const overallValidation = validateUserInput(newValues);
  const isValid = overallValidation.isValid;

  return {
    ...formState,
    values: newValues,
    errors: newErrors,
    touched: newTouched,
    isValid,
  };
};

/**
 * Mark field as touched (useful for blur events)
 */
export const touchFormField = (
  formState: FormState,
  fieldName: keyof UserInput
): FormState => {
  return {
    ...formState,
    touched: {
      ...formState.touched,
      [fieldName]: true,
    },
  };
};

/**
 * Validate entire form and return updated state
 */
export const validateForm = (formState: FormState): FormState => {
  const validation = validateUserInput(formState.values);

  // Group errors by field
  const errorsByField: Record<string, string[]> = {};
  validation.errors.forEach((error) => {
    if (!errorsByField[error.field]) {
      errorsByField[error.field] = [];
    }
    errorsByField[error.field].push(error.message);
  });

  // Mark all fields as touched during full validation
  const allTouched = Object.keys(formState.values).reduce(
    (acc, key) => {
      acc[key as keyof UserInput] = true;
      return acc;
    },
    {} as Record<string, boolean>
  );

  return {
    ...formState,
    errors: errorsByField,
    touched: allTouched,
    isValid: validation.isValid,
  };
};

/**
 * Prepare form data for submission (sanitize and validate)
 */
export const prepareFormSubmission = (
  formState: FormState
): { isValid: boolean; data?: UserInput; errors?: ValidationError[] } => {
  // Sanitize input
  const sanitizedData = sanitizeUserInput(formState.values);

  // Validate sanitized data
  const validation = validateUserInput(sanitizedData);

  if (validation.isValid) {
    return {
      isValid: true,
      data: sanitizedData,
    };
  } else {
    return {
      isValid: false,
      errors: validation.errors,
    };
  }
};

/**
 * Set form submission state
 */
export const setFormSubmitting = (
  formState: FormState,
  isSubmitting: boolean
): FormState => ({
  ...formState,
  isSubmitting,
});

/**
 * Reset form to initial state
 */
export const resetForm = (initialValues?: Partial<UserInput>): FormState => {
  return createInitialFormState(initialValues);
};

/**
 * Check if field should show error (touched and has error)
 */
export const shouldShowFieldError = (
  formState: FormState,
  fieldName: keyof UserInput
): boolean => {
  return !!(
    formState.touched[fieldName] && formState.errors[fieldName]?.length
  );
};

/**
 * Get error message for a specific field
 */
export const getFieldErrorMessage = (
  formState: FormState,
  fieldName: keyof UserInput
): string | undefined => {
  if (!shouldShowFieldError(formState, fieldName)) {
    return undefined;
  }
  return formState.errors[fieldName]?.[0];
};

/**
 * Check if field has any errors (regardless of touched state)
 */
export const hasFieldErrors = (
  formState: FormState,
  fieldName: keyof UserInput
): boolean => {
  return !!formState.errors[fieldName]?.length;
};

/**
 * Get all error messages for display
 */
export const getAllErrorMessages = (formState: FormState): string[] => {
  return Object.values(formState.errors).flat();
};

/**
 * Form field configurations for the prompt generator
 */
export const FORM_FIELD_CONFIGS: FormFieldConfig[] = [
  {
    name: 'websiteName',
    label: 'Website Name',
    placeholder:
      'e.g., "TaskFlow Pro", "Bella\'s Boutique", "John Smith Portfolio"',
    type: 'text',
    required: true,
    helpText: 'The name of your website or business (2-100 characters)',
  },
  {
    name: 'industry',
    label: 'Industry',
    placeholder: 'Select your industry...',
    type: 'select',
    required: true,
    helpText: 'Choose the industry that best describes your business',
  },
  {
    name: 'aboutInfo',
    label: 'About Your Website',
    placeholder:
      'Describe what your website is about, its main purpose, target audience, and key features you want to include...',
    type: 'textarea',
    required: true,
    helpText:
      "Provide details about your website's purpose and features (10-1000 characters)",
  },
  {
    name: 'additionalRequirements',
    label: 'Additional Requirements (Optional)',
    placeholder:
      'Any specific features, design preferences, or technical requirements...',
    type: 'textarea',
    required: false,
    helpText:
      'Optional: Specify any additional requirements or preferences (max 500 characters)',
  },
];

/**
 * Get form field configuration by name
 */
export const getFieldConfig = (
  fieldName: keyof UserInput
): FormFieldConfig | undefined => {
  return FORM_FIELD_CONFIGS.find((config) => config.name === fieldName);
};

/**
 * Debounce utility for real-time validation
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Create debounced field validator
 */
export const createDebouncedValidator = (
  onValidate: (fieldName: keyof UserInput, value: string) => void,
  delay = 300
) => {
  return debounce(onValidate, delay);
};
