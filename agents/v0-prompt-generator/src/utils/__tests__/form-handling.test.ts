import {
  createInitialFormState,
  updateFormField,
  touchFormField,
  validateForm,
  prepareFormSubmission,
  setFormSubmitting,
  resetForm,
  shouldShowFieldError,
  getFieldErrorMessage,
  hasFieldErrors,
  getAllErrorMessages,
  getFieldConfig,
  debounce,
  FORM_FIELD_CONFIGS,
} from '../form-handling';
import { UserInput } from '@/types';

describe('createInitialFormState', () => {
  it('should create initial form state with empty values', () => {
    const formState = createInitialFormState();

    expect(formState.values.websiteName).toBe('');
    expect(formState.values.industry).toBe('');
    expect(formState.values.aboutInfo).toBe('');
    expect(formState.values.additionalRequirements).toBe('');
    expect(formState.errors).toEqual({});
    expect(formState.touched).toEqual({});
    expect(formState.isSubmitting).toBe(false);
    expect(formState.isValid).toBe(false);
  });

  it('should create initial form state with provided values', () => {
    const initialValues = {
      websiteName: 'Test Site',
      industry: 'saas',
    };

    const formState = createInitialFormState(initialValues);

    expect(formState.values.websiteName).toBe('Test Site');
    expect(formState.values.industry).toBe('saas');
    expect(formState.values.aboutInfo).toBe('');
    expect(formState.values.additionalRequirements).toBe('');
  });
});

describe('updateFormField', () => {
  it('should update field value and validate', () => {
    const initialState = createInitialFormState();
    const updatedState = updateFormField(
      initialState,
      'websiteName',
      'My Website'
    );

    expect(updatedState.values.websiteName).toBe('My Website');
    expect(updatedState.touched.websiteName).toBe(true);
    expect(updatedState.errors.websiteName).toBeUndefined();
  });

  it('should add errors for invalid field values', () => {
    const initialState = createInitialFormState();
    const updatedState = updateFormField(initialState, 'websiteName', '');

    expect(updatedState.values.websiteName).toBe('');
    expect(updatedState.touched.websiteName).toBe(true);
    expect(updatedState.errors.websiteName).toHaveLength(1);
    expect(updatedState.isValid).toBe(false);
  });

  it('should remove errors when field becomes valid', () => {
    let formState = createInitialFormState();

    // First, create an error
    formState = updateFormField(formState, 'websiteName', '');
    expect(formState.errors.websiteName).toHaveLength(1);

    // Then fix the error
    formState = updateFormField(formState, 'websiteName', 'Valid Name');
    expect(formState.errors.websiteName).toBeUndefined();
  });

  it('should update overall form validity', () => {
    let formState = createInitialFormState();

    formState = updateFormField(formState, 'websiteName', 'Valid Website');
    formState = updateFormField(formState, 'industry', 'saas');
    formState = updateFormField(
      formState,
      'aboutInfo',
      'This is a detailed description of my website'
    );

    expect(formState.isValid).toBe(true);
  });
});

describe('touchFormField', () => {
  it('should mark field as touched', () => {
    const initialState = createInitialFormState();
    const touchedState = touchFormField(initialState, 'websiteName');

    expect(touchedState.touched.websiteName).toBe(true);
    expect(touchedState.values).toEqual(initialState.values);
  });
});

describe('validateForm', () => {
  it('should validate entire form and mark all fields as touched', () => {
    const formState = createInitialFormState({
      websiteName: '',
      industry: '',
      aboutInfo: '',
    });

    const validatedState = validateForm(formState);

    expect(validatedState.isValid).toBe(false);
    expect(validatedState.touched.websiteName).toBe(true);
    expect(validatedState.touched.industry).toBe(true);
    expect(validatedState.touched.aboutInfo).toBe(true);
    expect(validatedState.errors.websiteName).toHaveLength(1);
    expect(validatedState.errors.industry).toHaveLength(1);
    expect(validatedState.errors.aboutInfo).toHaveLength(1);
  });

  it('should pass validation for valid form', () => {
    const formState = createInitialFormState({
      websiteName: 'Valid Website',
      industry: 'saas',
      aboutInfo: 'This is a detailed description of my website',
    });

    const validatedState = validateForm(formState);

    expect(validatedState.isValid).toBe(true);
    expect(Object.keys(validatedState.errors)).toHaveLength(0);
  });
});

describe('prepareFormSubmission', () => {
  it('should return sanitized data for valid form', () => {
    const formState = createInitialFormState({
      websiteName: '  Valid Website  ',
      industry: 'saas',
      aboutInfo: 'This is a detailed description of my website',
    });

    const result = prepareFormSubmission(formState);

    expect(result.isValid).toBe(true);
    expect(result.data?.websiteName).toBe('Valid Website');
    expect(result.errors).toBeUndefined();
  });

  it('should return errors for invalid form', () => {
    const formState = createInitialFormState({
      websiteName: '',
      industry: '',
      aboutInfo: '',
    });

    const result = prepareFormSubmission(formState);

    expect(result.isValid).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toHaveLength(3);
  });

  it('should sanitize input during preparation', () => {
    const formState = createInitialFormState({
      websiteName: '<script>alert("xss")</script>My Site',
      industry: 'saas',
      aboutInfo:
        'About my site with <div>HTML</div> content that is long enough to pass validation',
    });

    const result = prepareFormSubmission(formState);

    expect(result.isValid).toBe(true);
    expect(result.data?.websiteName).toBe('My Site');
    expect(result.data?.aboutInfo).toBe(
      'About my site with HTML content that is long enough to pass validation'
    );
  });
});

describe('setFormSubmitting', () => {
  it('should update submission state', () => {
    const formState = createInitialFormState();
    const submittingState = setFormSubmitting(formState, true);

    expect(submittingState.isSubmitting).toBe(true);

    const notSubmittingState = setFormSubmitting(submittingState, false);
    expect(notSubmittingState.isSubmitting).toBe(false);
  });
});

describe('resetForm', () => {
  it('should reset form to initial state', () => {
    const resetState = resetForm();
    const initialState = createInitialFormState();

    expect(resetState).toEqual(initialState);
  });

  it('should reset form with new initial values', () => {
    const initialValues = { websiteName: 'New Site' };
    const resetState = resetForm(initialValues);

    expect(resetState.values.websiteName).toBe('New Site');
    expect(resetState.errors).toEqual({});
    expect(resetState.touched).toEqual({});
  });
});

describe('shouldShowFieldError', () => {
  it('should return true when field is touched and has errors', () => {
    const formState = {
      ...createInitialFormState(),
      touched: { websiteName: true },
      errors: { websiteName: ['Error message'] },
    };

    expect(shouldShowFieldError(formState, 'websiteName')).toBe(true);
  });

  it('should return false when field is not touched', () => {
    const formState = {
      ...createInitialFormState(),
      touched: { websiteName: false },
      errors: { websiteName: ['Error message'] },
    };

    expect(shouldShowFieldError(formState, 'websiteName')).toBe(false);
  });

  it('should return false when field has no errors', () => {
    const formState = {
      ...createInitialFormState(),
      touched: { websiteName: true },
      errors: {},
    };

    expect(shouldShowFieldError(formState, 'websiteName')).toBe(false);
  });
});

describe('getFieldErrorMessage', () => {
  it('should return first error message for touched field with errors', () => {
    const formState = {
      ...createInitialFormState(),
      touched: { websiteName: true },
      errors: { websiteName: ['First error', 'Second error'] },
    };

    expect(getFieldErrorMessage(formState, 'websiteName')).toBe('First error');
  });

  it('should return undefined for untouched field', () => {
    const formState = {
      ...createInitialFormState(),
      touched: { websiteName: false },
      errors: { websiteName: ['Error message'] },
    };

    expect(getFieldErrorMessage(formState, 'websiteName')).toBeUndefined();
  });
});

describe('hasFieldErrors', () => {
  it('should return true when field has errors regardless of touched state', () => {
    const formState = {
      ...createInitialFormState(),
      touched: { websiteName: false },
      errors: { websiteName: ['Error message'] },
    };

    expect(hasFieldErrors(formState, 'websiteName')).toBe(true);
  });

  it('should return false when field has no errors', () => {
    const formState = {
      ...createInitialFormState(),
      touched: { websiteName: true },
      errors: {},
    };

    expect(hasFieldErrors(formState, 'websiteName')).toBe(false);
  });
});

describe('getAllErrorMessages', () => {
  it('should return all error messages from all fields', () => {
    const formState = {
      ...createInitialFormState(),
      errors: {
        websiteName: ['Website error 1', 'Website error 2'],
        industry: ['Industry error'],
      },
    };

    const messages = getAllErrorMessages(formState);
    expect(messages).toHaveLength(3);
    expect(messages).toContain('Website error 1');
    expect(messages).toContain('Website error 2');
    expect(messages).toContain('Industry error');
  });

  it('should return empty array when no errors', () => {
    const formState = createInitialFormState();
    const messages = getAllErrorMessages(formState);
    expect(messages).toHaveLength(0);
  });
});

describe('FORM_FIELD_CONFIGS', () => {
  it('should have configurations for all required fields', () => {
    const fieldNames = FORM_FIELD_CONFIGS.map((config) => config.name);
    expect(fieldNames).toContain('websiteName');
    expect(fieldNames).toContain('industry');
    expect(fieldNames).toContain('aboutInfo');
    expect(fieldNames).toContain('additionalRequirements');
  });

  it('should have proper configuration structure', () => {
    FORM_FIELD_CONFIGS.forEach((config) => {
      expect(config.name).toBeDefined();
      expect(config.label).toBeDefined();
      expect(config.placeholder).toBeDefined();
      expect(config.type).toBeDefined();
      expect(typeof config.required).toBe('boolean');
    });
  });
});

describe('getFieldConfig', () => {
  it('should return configuration for existing field', () => {
    const config = getFieldConfig('websiteName');
    expect(config).toBeDefined();
    expect(config?.name).toBe('websiteName');
    expect(config?.label).toBe('Website Name');
  });

  it('should return undefined for non-existing field', () => {
    const config = getFieldConfig('nonExistentField' as any);
    expect(config).toBeUndefined();
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  it('should delay function execution', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('test');
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should cancel previous calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    debouncedFn('second');

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});
