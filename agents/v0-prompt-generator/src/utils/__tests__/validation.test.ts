import {
  validateUserInput,
  validateWebsiteName,
  validateIndustry,
  validateAboutInfo,
  validateAdditionalRequirements,
  sanitizeInput,
  sanitizeUserInput,
  validateField,
  getErrorsByField,
  getFieldError,
  hasFieldError,
} from '../validation';
import { UserInput } from '@/types';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello World<div>test</div>';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello Worldtest');
  });

  it('should escape dangerous characters', () => {
    const input = 'Hello <>&"\'';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello &amp;&quot;&#x27;');
  });

  it('should normalize whitespace', () => {
    const input = '  Hello    World  \n\t  ';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello World');
  });

  it('should handle empty input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
  });
});

describe('sanitizeUserInput', () => {
  it('should sanitize all fields in user input', () => {
    const input: UserInput = {
      websiteName: '<script>alert("xss")</script>My Site',
      industry: 'saas',
      aboutInfo: 'About  my   site<div>test</div>',
      additionalRequirements: 'Extra <>&"\' requirements',
    };

    const result = sanitizeUserInput(input);
    expect(result.websiteName).toBe('My Site');
    expect(result.industry).toBe('saas');
    expect(result.aboutInfo).toBe('About my sitetest');
    expect(result.additionalRequirements).toBe(
      'Extra &amp;&quot;&#x27; requirements'
    );
  });
});

describe('validateWebsiteName', () => {
  it('should pass for valid website name', () => {
    const errors = validateWebsiteName('My Great Website');
    expect(errors).toHaveLength(0);
  });

  it('should fail for empty website name', () => {
    const errors = validateWebsiteName('');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('REQUIRED_FIELD');
    expect(errors[0].field).toBe('websiteName');
  });

  it('should fail for too short website name', () => {
    const errors = validateWebsiteName('A');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('MIN_LENGTH');
  });

  it('should fail for too long website name', () => {
    const errors = validateWebsiteName('A'.repeat(101));
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('MAX_LENGTH');
  });

  it('should fail for invalid characters', () => {
    const errors = validateWebsiteName('My Site @#$%');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_CHARACTERS');
  });

  it('should pass for valid characters', () => {
    const errors = validateWebsiteName('My-Site_2024 Co');
    expect(errors).toHaveLength(0);
  });
});

describe('validateIndustry', () => {
  it('should pass for valid industry', () => {
    const errors = validateIndustry('saas');
    expect(errors).toHaveLength(0);
  });

  it('should fail for empty industry', () => {
    const errors = validateIndustry('');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('REQUIRED_FIELD');
  });

  it('should fail for invalid industry', () => {
    const errors = validateIndustry('invalid-industry');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_SELECTION');
  });
});

describe('validateAboutInfo', () => {
  it('should pass for valid about info', () => {
    const errors = validateAboutInfo(
      'This is a detailed description of my website'
    );
    expect(errors).toHaveLength(0);
  });

  it('should fail for empty about info', () => {
    const errors = validateAboutInfo('');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('REQUIRED_FIELD');
  });

  it('should fail for too short about info', () => {
    const errors = validateAboutInfo('Short');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('MIN_LENGTH');
  });

  it('should fail for too long about info', () => {
    const errors = validateAboutInfo('A'.repeat(1001));
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some((e) => e.code === 'MAX_LENGTH')).toBe(true);
  });

  it('should fail for repeated characters', () => {
    const errors = validateAboutInfo('aaaaaaaaaa');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_CONTENT');
  });
});

describe('validateAdditionalRequirements', () => {
  it('should pass for empty additional requirements', () => {
    const errors = validateAdditionalRequirements(undefined);
    expect(errors).toHaveLength(0);
  });

  it('should pass for valid additional requirements', () => {
    const errors = validateAdditionalRequirements(
      'Some additional requirements'
    );
    expect(errors).toHaveLength(0);
  });

  it('should fail for too long additional requirements', () => {
    const errors = validateAdditionalRequirements('A'.repeat(501));
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('MAX_LENGTH');
  });
});

describe('validateUserInput', () => {
  it('should return valid for correct input', () => {
    const input: UserInput = {
      websiteName: 'Test Website',
      industry: 'saas',
      aboutInfo: 'A test website for SaaS business with detailed description',
    };

    const result = validateUserInput(input);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return invalid for missing required fields', () => {
    const input: UserInput = {
      websiteName: '',
      industry: '',
      aboutInfo: '',
    };

    const result = validateUserInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(3);
    expect(result.errors.some((e) => e.field === 'websiteName')).toBe(true);
    expect(result.errors.some((e) => e.field === 'industry')).toBe(true);
    expect(result.errors.some((e) => e.field === 'aboutInfo')).toBe(true);
  });

  it('should return invalid for input that is too long', () => {
    const input: UserInput = {
      websiteName: 'A'.repeat(101),
      industry: 'saas',
      aboutInfo: 'A'.repeat(1001),
    };

    const result = validateUserInput(input);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (e) => e.code === 'MAX_LENGTH' && e.field === 'websiteName'
      )
    ).toBe(true);
    expect(
      result.errors.some(
        (e) => e.code === 'MAX_LENGTH' && e.field === 'aboutInfo'
      )
    ).toBe(true);
  });

  it('should validate additional requirements', () => {
    const input: UserInput = {
      websiteName: 'Test Website',
      industry: 'saas',
      aboutInfo: 'A test website for SaaS business with detailed description',
      additionalRequirements: 'A'.repeat(501),
    };

    const result = validateUserInput(input);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.field === 'additionalRequirements')
    ).toBe(true);
  });
});

describe('validateField', () => {
  it('should validate individual fields correctly', () => {
    expect(validateField('websiteName', 'Valid Name')).toHaveLength(0);
    expect(validateField('websiteName', '')).toHaveLength(1);
    expect(validateField('industry', 'saas')).toHaveLength(0);
    expect(validateField('industry', 'invalid')).toHaveLength(1);
    expect(
      validateField('aboutInfo', 'Valid description with enough content')
    ).toHaveLength(0);
    expect(validateField('aboutInfo', 'Short')).toHaveLength(1);
  });
});

describe('getErrorsByField', () => {
  it('should group errors by field', () => {
    const errors = [
      { field: 'websiteName', message: 'Error 1', code: 'TEST' },
      { field: 'websiteName', message: 'Error 2', code: 'TEST' },
      { field: 'industry', message: 'Error 3', code: 'TEST' },
    ];

    const result = getErrorsByField(errors);
    expect(result.websiteName).toEqual(['Error 1', 'Error 2']);
    expect(result.industry).toEqual(['Error 3']);
  });
});

describe('getFieldError', () => {
  it('should return first error for field', () => {
    const errors = [
      { field: 'websiteName', message: 'Error 1', code: 'TEST' },
      { field: 'websiteName', message: 'Error 2', code: 'TEST' },
    ];

    const result = getFieldError(errors, 'websiteName');
    expect(result).toBe('Error 1');
  });

  it('should return undefined for field with no errors', () => {
    const errors = [{ field: 'websiteName', message: 'Error 1', code: 'TEST' }];

    const result = getFieldError(errors, 'industry');
    expect(result).toBeUndefined();
  });
});

describe('hasFieldError', () => {
  it('should return true if field has errors', () => {
    const errors = [{ field: 'websiteName', message: 'Error 1', code: 'TEST' }];

    expect(hasFieldError(errors, 'websiteName')).toBe(true);
    expect(hasFieldError(errors, 'industry')).toBe(false);
  });
});
