// Input validation utilities

import {
  UserInput,
  ValidationResult,
  ValidationError,
  InputValidationRules,
} from '@/types';
import { getAvailableIndustries } from '@/lib/industry-config';

/**
 * Default validation rules for user input
 */
export const DEFAULT_VALIDATION_RULES: InputValidationRules = {
  websiteName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  industry: {
    required: true,
    allowedValues: getAvailableIndustries(),
  },
  aboutInfo: {
    required: true,
    minLength: 10,
    maxLength: 1000,
  },
  additionalRequirements: {
    required: false,
    maxLength: 500,
  },
};

/**
 * Sanitize user input to prevent XSS and clean up formatting
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  let sanitized = input.trim();

  // Remove script content first
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Escape potentially dangerous characters that might remain
  sanitized = sanitized.replace(/[<>&"']/g, (match) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    };
    return entities[match] || match;
  });

  return sanitized;
};

/**
 * Sanitize entire user input object
 */
export const sanitizeUserInput = (input: UserInput): UserInput => {
  return {
    websiteName: sanitizeInput(input.websiteName),
    industry: sanitizeInput(input.industry),
    aboutInfo: sanitizeInput(input.aboutInfo),
    additionalRequirements: input.additionalRequirements
      ? sanitizeInput(input.additionalRequirements)
      : '',
  };
};

/**
 * Validate website name field
 */
export const validateWebsiteName = (
  websiteName: string,
  rules = DEFAULT_VALIDATION_RULES.websiteName
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const sanitized = sanitizeInput(websiteName);

  if (rules.required && !sanitized) {
    errors.push({
      field: 'websiteName',
      message: 'Website name is required',
      code: 'REQUIRED_FIELD',
    });
    return errors;
  }

  if (sanitized && sanitized.length < rules.minLength) {
    errors.push({
      field: 'websiteName',
      message: `Website name must be at least ${rules.minLength} characters`,
      code: 'MIN_LENGTH',
    });
  }

  if (sanitized && sanitized.length > rules.maxLength) {
    errors.push({
      field: 'websiteName',
      message: `Website name must be less than ${rules.maxLength} characters`,
      code: 'MAX_LENGTH',
    });
  }

  // Check for valid characters (letters, numbers, spaces, basic punctuation)
  // Allow common business characters including escaped entities
  if (sanitized && !/^[a-zA-Z0-9\s\-_.&(),'!;#]+$/.test(sanitized)) {
    errors.push({
      field: 'websiteName',
      message: 'Website name contains invalid characters',
      code: 'INVALID_CHARACTERS',
    });
  }

  return errors;
};

/**
 * Validate industry selection
 */
export const validateIndustry = (
  industry: string,
  rules = DEFAULT_VALIDATION_RULES.industry
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const sanitized = sanitizeInput(industry);

  if (rules.required && !sanitized) {
    errors.push({
      field: 'industry',
      message: 'Industry selection is required',
      code: 'REQUIRED_FIELD',
    });
    return errors;
  }

  if (
    rules.allowedValues &&
    sanitized &&
    !rules.allowedValues.includes(sanitized)
  ) {
    errors.push({
      field: 'industry',
      message: 'Please select a valid industry from the available options',
      code: 'INVALID_SELECTION',
    });
  }

  return errors;
};

/**
 * Validate about information field
 */
export const validateAboutInfo = (
  aboutInfo: string,
  rules = DEFAULT_VALIDATION_RULES.aboutInfo
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const sanitized = sanitizeInput(aboutInfo);

  if (rules.required && !sanitized) {
    errors.push({
      field: 'aboutInfo',
      message: 'About information is required',
      code: 'REQUIRED_FIELD',
    });
    return errors;
  }

  if (sanitized && sanitized.length < rules.minLength) {
    errors.push({
      field: 'aboutInfo',
      message: `About information must be at least ${rules.minLength} characters`,
      code: 'MIN_LENGTH',
    });
  }

  if (sanitized && sanitized.length > rules.maxLength) {
    errors.push({
      field: 'aboutInfo',
      message: `About information must be less than ${rules.maxLength} characters`,
      code: 'MAX_LENGTH',
    });
  }

  // Check for meaningful content (not just repeated characters or spaces)
  if (sanitized && /^(.)\1{9,}$/.test(sanitized.replace(/\s/g, ''))) {
    errors.push({
      field: 'aboutInfo',
      message: 'Please provide meaningful information about your website',
      code: 'INVALID_CONTENT',
    });
  }

  return errors;
};

/**
 * Validate additional requirements field
 */
export const validateAdditionalRequirements = (
  additionalRequirements: string | undefined,
  rules = DEFAULT_VALIDATION_RULES.additionalRequirements
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!additionalRequirements) {
    return errors; // Optional field
  }

  const sanitized = sanitizeInput(additionalRequirements);

  if (sanitized.length > rules.maxLength) {
    errors.push({
      field: 'additionalRequirements',
      message: `Additional requirements must be less than ${rules.maxLength} characters`,
      code: 'MAX_LENGTH',
    });
  }

  return errors;
};

/**
 * Comprehensive validation of user input
 */
export const validateUserInput = (
  input: UserInput,
  rules = DEFAULT_VALIDATION_RULES
): ValidationResult => {
  const allErrors: ValidationError[] = [
    ...validateWebsiteName(input.websiteName, rules.websiteName),
    ...validateIndustry(input.industry, rules.industry),
    ...validateAboutInfo(input.aboutInfo, rules.aboutInfo),
    ...validateAdditionalRequirements(
      input.additionalRequirements,
      rules.additionalRequirements
    ),
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Get validation error messages grouped by field
 */
export const getErrorsByField = (
  errors: ValidationError[]
): Record<string, string[]> => {
  return errors.reduce(
    (acc, error) => {
      if (!acc[error.field]) {
        acc[error.field] = [];
      }
      acc[error.field].push(error.message);
      return acc;
    },
    {} as Record<string, string[]>
  );
};

/**
 * Get the first error message for a specific field
 */
export const getFieldError = (
  errors: ValidationError[],
  field: string
): string | undefined => {
  const fieldError = errors.find((error) => error.field === field);
  return fieldError?.message;
};

/**
 * Check if a specific field has errors
 */
export const hasFieldError = (
  errors: ValidationError[],
  field: string
): boolean => {
  return errors.some((error) => error.field === field);
};

/**
 * Validate individual field (useful for real-time validation)
 */
export const validateField = (
  fieldName: keyof UserInput,
  value: string | undefined,
  rules = DEFAULT_VALIDATION_RULES
): ValidationError[] => {
  switch (fieldName) {
    case 'websiteName':
      return validateWebsiteName(value || '', rules.websiteName);
    case 'industry':
      return validateIndustry(value || '', rules.industry);
    case 'aboutInfo':
      return validateAboutInfo(value || '', rules.aboutInfo);
    case 'additionalRequirements':
      return validateAdditionalRequirements(
        value,
        rules.additionalRequirements
      );
    default:
      return [];
  }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use validateUserInput instead
 */
export const validateUserInputLegacy = (
  input: UserInput
): { isValid: boolean; errors: string[] } => {
  const result = validateUserInput(input);
  return {
    isValid: result.isValid,
    errors: result.errors.map((error) => error.message),
  };
};
