// Example usage of validation and form handling utilities

import { UserInput } from '@/types';
import {
  validateUserInput,
  sanitizeUserInput,
  validateField,
  getErrorsByField,
} from '../validation';
import {
  createInitialFormState,
  updateFormField,
  validateForm,
  prepareFormSubmission,
  shouldShowFieldError,
  getFieldErrorMessage,
} from '../form-handling';

/**
 * Example 1: Basic input validation
 */
export function basicValidationExample() {
  const userInput: UserInput = {
    websiteName: 'My Awesome Website',
    industry: 'saas',
    aboutInfo: 'This is a comprehensive SaaS platform for project management',
    additionalRequirements: 'Need integration with Slack and Google Calendar',
  };

  // Validate the input
  const validation = validateUserInput(userInput);

  if (validation.isValid) {
    console.log('✅ Input is valid!');
  } else {
    console.log('❌ Validation errors:');
    validation.errors.forEach((error) => {
      console.log(`  - ${error.field}: ${error.message}`);
    });
  }

  return validation;
}

/**
 * Example 2: Input sanitization
 */
export function sanitizationExample() {
  const unsafeInput: UserInput = {
    websiteName: '<script>alert("xss")</script>My Site',
    industry: 'saas',
    aboutInfo: 'About my site with <div>HTML</div> content',
    additionalRequirements: 'Extra <>&"\' requirements',
  };

  console.log('Before sanitization:', unsafeInput);

  const sanitizedInput = sanitizeUserInput(unsafeInput);

  console.log('After sanitization:', sanitizedInput);

  return sanitizedInput;
}

/**
 * Example 3: Individual field validation
 */
export function fieldValidationExample() {
  const websiteName = '';
  const industry = 'invalid-industry';
  const aboutInfo = 'Too short';

  console.log('Validating individual fields:');

  const websiteNameErrors = validateField('websiteName', websiteName);
  console.log(
    'Website name errors:',
    websiteNameErrors.map((e) => e.message)
  );

  const industryErrors = validateField('industry', industry);
  console.log(
    'Industry errors:',
    industryErrors.map((e) => e.message)
  );

  const aboutInfoErrors = validateField('aboutInfo', aboutInfo);
  console.log(
    'About info errors:',
    aboutInfoErrors.map((e) => e.message)
  );
}

/**
 * Example 4: Form state management
 */
export function formStateExample() {
  // Create initial form state
  let formState = createInitialFormState();
  console.log('Initial form state:', formState);

  // Update fields one by one
  formState = updateFormField(formState, 'websiteName', 'My Website');
  formState = updateFormField(formState, 'industry', 'saas');
  formState = updateFormField(
    formState,
    'aboutInfo',
    'This is a detailed description of my website'
  );

  console.log('Updated form state:', formState);
  console.log('Is form valid?', formState.isValid);

  // Check if we should show errors for specific fields
  console.log(
    'Should show website name error?',
    shouldShowFieldError(formState, 'websiteName')
  );
  console.log(
    'Website name error message:',
    getFieldErrorMessage(formState, 'websiteName')
  );

  return formState;
}

/**
 * Example 5: Form submission preparation
 */
export function formSubmissionExample() {
  const formState = createInitialFormState({
    websiteName: '  My Website  ',
    industry: 'saas',
    aboutInfo: 'This is a detailed description of my website',
  });

  const submissionResult = prepareFormSubmission(formState);

  if (submissionResult.isValid && submissionResult.data) {
    console.log('✅ Form ready for submission!');
    console.log('Sanitized data:', submissionResult.data);

    // Here you would typically send the data to your API
    // await submitToAPI(submissionResult.data);
  } else {
    console.log('❌ Form has validation errors:');
    submissionResult.errors?.forEach((error) => {
      console.log(`  - ${error.field}: ${error.message}`);
    });
  }

  return submissionResult;
}

/**
 * Example 6: Error handling and display
 */
export function errorHandlingExample() {
  const invalidInput: UserInput = {
    websiteName: '',
    industry: 'invalid',
    aboutInfo: 'Short',
    additionalRequirements: 'A'.repeat(501), // Too long
  };

  const validation = validateUserInput(invalidInput);

  if (!validation.isValid) {
    // Group errors by field for display
    const errorsByField = getErrorsByField(validation.errors);

    console.log('Errors grouped by field:');
    Object.entries(errorsByField).forEach(([field, messages]) => {
      console.log(`${field}:`);
      messages.forEach((message) => console.log(`  - ${message}`));
    });
  }

  return getErrorsByField(validation.errors);
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log('=== Basic Validation Example ===');
  basicValidationExample();

  console.log('\n=== Sanitization Example ===');
  sanitizationExample();

  console.log('\n=== Field Validation Example ===');
  fieldValidationExample();

  console.log('\n=== Form State Example ===');
  formStateExample();

  console.log('\n=== Form Submission Example ===');
  formSubmissionExample();

  console.log('\n=== Error Handling Example ===');
  errorHandlingExample();
}

// Uncomment to run examples
// runAllExamples();
