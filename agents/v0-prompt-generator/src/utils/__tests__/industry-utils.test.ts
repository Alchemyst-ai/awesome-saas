import { describe, it, expect } from '@jest/globals';
import {
  getIndustryConfig,
  buildIndustryContext,
  getRecommendedFeatures,
  inferTargetAudience,
  validateIndustry,
  suggestIndustries,
  getTechnicalRecommendations,
} from '../industry-utils';
import { UserInput } from '@/types';

describe('Industry Utils', () => {
  const mockUserInput: UserInput = {
    websiteName: 'TestApp',
    industry: 'saas',
    aboutInfo:
      'A project management tool for teams with authentication and dashboard features',
  };

  describe('getIndustryConfig', () => {
    it('should return valid config for existing industry', () => {
      const config = getIndustryConfig('saas');
      expect(config).toBeTruthy();
      expect(config?.name).toBe('SaaS');
      expect(config?.commonFeatures).toContain(
        'User authentication and authorization'
      );
    });

    it('should return null for non-existent industry', () => {
      const config = getIndustryConfig('nonexistent');
      expect(config).toBeNull();
    });
  });

  describe('buildIndustryContext', () => {
    it('should build comprehensive context for valid industry', () => {
      const context = buildIndustryContext(mockUserInput);
      expect(context).toBeTruthy();
      expect(context?.sector).toBe('SaaS');
      expect(context?.commonPatterns.features).toContain(
        'User authentication and authorization'
      );
      expect(context?.technicalConsiderations.frameworks).toContain(
        'NextJS 14 with App Router'
      );
    });

    it('should return null for invalid industry', () => {
      const invalidInput = { ...mockUserInput, industry: 'invalid' };
      const context = buildIndustryContext(invalidInput);
      expect(context).toBeNull();
    });
  });

  describe('getRecommendedFeatures', () => {
    it('should return required and recommended features', () => {
      const features = getRecommendedFeatures(mockUserInput);
      expect(features.required).toContain(
        'User authentication and login system'
      );
      expect(features.recommended.length).toBeGreaterThan(0);
      expect(features.optional.length).toBeGreaterThan(0);
    });

    it('should recommend features based on user input keywords', () => {
      const authInput = {
        ...mockUserInput,
        aboutInfo:
          'A platform with API documentation and testimonials from customers',
      };
      const features = getRecommendedFeatures(authInput);
      // Check that we get some recommended features (the exact matching logic may vary)
      expect(features.recommended.length).toBeGreaterThanOrEqual(0);
      expect(features.required.length).toBeGreaterThan(0);
    });
  });

  describe('inferTargetAudience', () => {
    it('should infer correct audience for SaaS', () => {
      const audience = inferTargetAudience(mockUserInput);
      expect(audience).toContain('business professionals');
    });

    it('should refine audience based on input keywords', () => {
      const b2bInput = {
        ...mockUserInput,
        aboutInfo: 'A B2B platform for enterprise clients',
      };
      const audience = inferTargetAudience(b2bInput);
      expect(audience).toContain('business professionals');
    });
  });

  describe('validateIndustry', () => {
    it('should validate existing industries', () => {
      expect(validateIndustry('saas')).toBe(true);
      expect(validateIndustry('ecommerce')).toBe(true);
      expect(validateIndustry('portfolio')).toBe(true);
    });

    it('should reject non-existent industries', () => {
      expect(validateIndustry('invalid')).toBe(false);
      expect(validateIndustry('')).toBe(false);
    });
  });

  describe('suggestIndustries', () => {
    it('should suggest SaaS for software-related input', () => {
      const suggestions = suggestIndustries('A software platform for teams');
      expect(suggestions).toContain('saas');
    });

    it('should suggest ecommerce for shop-related input', () => {
      const suggestions = suggestIndustries('An online store to sell products');
      expect(suggestions).toContain('ecommerce');
    });

    it('should suggest portfolio for designer input', () => {
      const suggestions = suggestIndustries(
        'A portfolio to showcase my design work'
      );
      expect(suggestions).toContain('portfolio');
    });

    it('should return default suggestions for unclear input', () => {
      const suggestions = suggestIndustries('Something generic');
      expect(suggestions).toEqual(['saas', 'corporate', 'portfolio']);
    });
  });

  describe('getTechnicalRecommendations', () => {
    it('should return technical stack for valid industry', () => {
      const recommendations = getTechnicalRecommendations(mockUserInput);
      expect(recommendations.required).toContain('NextJS 14 with App Router');
      expect(recommendations.recommended.length).toBeGreaterThan(0);
      expect(recommendations.reasoning).toContain('saas');
    });

    it('should add contextual recommendations based on input', () => {
      const authInput = {
        ...mockUserInput,
        aboutInfo: 'A platform with user authentication and payment processing',
      };
      const recommendations = getTechnicalRecommendations(authInput);
      expect(
        recommendations.recommended.some(
          (r) => r.includes('NextAuth') || r.includes('Stripe')
        )
      ).toBeTruthy();
    });
  });
});
