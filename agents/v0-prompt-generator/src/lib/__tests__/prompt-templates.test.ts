import {
  BASE_PROMPT_TEMPLATE,
  INDUSTRY_TEMPLATES,
  getIndustryTemplate,
  getTemplateTypes,
} from '../prompt-templates';

describe('Prompt Templates', () => {
  describe('BASE_PROMPT_TEMPLATE', () => {
    it('should have all required structure sections', () => {
      expect(BASE_PROMPT_TEMPLATE.structure).toHaveProperty('introduction');
      expect(BASE_PROMPT_TEMPLATE.structure).toHaveProperty('context');
      expect(BASE_PROMPT_TEMPLATE.structure).toHaveProperty('technicalSpecs');
      expect(BASE_PROMPT_TEMPLATE.structure).toHaveProperty(
        'designRequirements'
      );
      expect(BASE_PROMPT_TEMPLATE.structure).toHaveProperty(
        'functionalRequirements'
      );
    });

    it('should have placeholders for all template variables', () => {
      const placeholders = BASE_PROMPT_TEMPLATE.placeholders;
      expect(placeholders).toHaveProperty('{{websiteName}}');
      expect(placeholders).toHaveProperty('{{industry}}');
      expect(placeholders).toHaveProperty('{{aboutInfo}}');
      expect(placeholders).toHaveProperty('{{targetAudience}}');
      expect(placeholders).toHaveProperty('{{primaryValue}}');
    });

    it('should have industry-specific configurations', () => {
      const industrySpecific = BASE_PROMPT_TEMPLATE.industrySpecific;
      expect(industrySpecific).toHaveProperty('saas');
      expect(industrySpecific).toHaveProperty('ecommerce');
      expect(industrySpecific).toHaveProperty('portfolio');
      expect(industrySpecific).toHaveProperty('corporate');
      expect(industrySpecific).toHaveProperty('startup');
      expect(industrySpecific).toHaveProperty('agency');
    });

    it('should have arrays of features for each industry', () => {
      Object.values(BASE_PROMPT_TEMPLATE.industrySpecific).forEach(
        (features) => {
          expect(Array.isArray(features)).toBe(true);
          expect(features.length).toBeGreaterThan(0);
        }
      );
    });
  });

  describe('INDUSTRY_TEMPLATES', () => {
    it('should have templates for all major industries', () => {
      const expectedIndustries = [
        'saas',
        'ecommerce',
        'portfolio',
        'corporate',
        'startup',
        'agency',
      ];
      expectedIndustries.forEach((industry) => {
        expect(INDUSTRY_TEMPLATES).toHaveProperty(industry);
      });
    });

    it('should have consistent structure for all industry templates', () => {
      Object.values(INDUSTRY_TEMPLATES).forEach((template) => {
        expect(template).toHaveProperty('industry');
        expect(template).toHaveProperty('templateType');
        expect(template).toHaveProperty('sections');
        expect(template).toHaveProperty('placeholders');
        expect(template).toHaveProperty('customizations');
      });
    });

    it('should have all required sections for each template', () => {
      Object.values(INDUSTRY_TEMPLATES).forEach((template) => {
        expect(template.sections).toHaveProperty('hero');
        expect(template.sections).toHaveProperty('features');
        expect(template.sections).toHaveProperty('about');
        expect(template.sections).toHaveProperty('contact');
        expect(template.sections).toHaveProperty('additional');
      });
    });

    it('should have customization options for each template', () => {
      Object.values(INDUSTRY_TEMPLATES).forEach((template) => {
        expect(template.customizations).toHaveProperty('colors');
        expect(template.customizations).toHaveProperty('fonts');
        expect(template.customizations).toHaveProperty('layouts');
        expect(Array.isArray(template.customizations.colors)).toBe(true);
        expect(Array.isArray(template.customizations.fonts)).toBe(true);
        expect(Array.isArray(template.customizations.layouts)).toBe(true);
      });
    });
  });

  describe('SaaS Template', () => {
    const saasTemplate = INDUSTRY_TEMPLATES.saas;

    it('should have correct industry and template type', () => {
      expect(saasTemplate.industry).toBe('saas');
      expect(saasTemplate.templateType).toBe('advanced');
    });

    it('should have SaaS-specific placeholders', () => {
      expect(saasTemplate.placeholders).toHaveProperty('{{primaryBenefit}}');
      expect(saasTemplate.placeholders).toHaveProperty('{{problemSolved}}');
      expect(saasTemplate.placeholders).toHaveProperty('{{primaryAction}}');
      expect(saasTemplate.placeholders).toHaveProperty('{{keyFeatures}}');
    });

    it('should have appropriate additional sections', () => {
      expect(saasTemplate.sections.additional).toContain(
        'pricing section with subscription tiers'
      );
      expect(saasTemplate.sections.additional).toContain(
        'testimonials from satisfied customers'
      );
      expect(saasTemplate.sections.additional).toContain(
        'integration showcase with popular tools'
      );
    });

    it('should have appropriate color schemes', () => {
      expect(saasTemplate.customizations.colors).toContain('blue');
      expect(saasTemplate.customizations.colors).toContain('indigo');
    });
  });

  describe('E-commerce Template', () => {
    const ecommerceTemplate = INDUSTRY_TEMPLATES.ecommerce;

    it('should have correct industry and template type', () => {
      expect(ecommerceTemplate.industry).toBe('ecommerce');
      expect(ecommerceTemplate.templateType).toBe('advanced');
    });

    it('should have e-commerce-specific placeholders', () => {
      expect(ecommerceTemplate.placeholders).toHaveProperty('{{heroContent}}');
      expect(ecommerceTemplate.placeholders).toHaveProperty('{{productTypes}}');
      expect(ecommerceTemplate.placeholders).toHaveProperty(
        '{{filterCategories}}'
      );
      expect(ecommerceTemplate.placeholders).toHaveProperty('{{brandStory}}');
    });

    it('should have e-commerce-specific additional sections', () => {
      expect(ecommerceTemplate.sections.additional).toContain(
        'featured products carousel'
      );
      expect(ecommerceTemplate.sections.additional).toContain(
        'customer reviews and ratings'
      );
      expect(ecommerceTemplate.sections.additional).toContain(
        'trust badges and security certifications'
      );
    });
  });

  describe('Portfolio Template', () => {
    const portfolioTemplate = INDUSTRY_TEMPLATES.portfolio;

    it('should have correct industry and template type', () => {
      expect(portfolioTemplate.industry).toBe('portfolio');
      expect(portfolioTemplate.templateType).toBe('basic');
    });

    it('should have portfolio-specific placeholders', () => {
      expect(portfolioTemplate.placeholders).toHaveProperty('{{fullName}}');
      expect(portfolioTemplate.placeholders).toHaveProperty('{{profession}}');
      expect(portfolioTemplate.placeholders).toHaveProperty('{{expertise}}');
      expect(portfolioTemplate.placeholders).toHaveProperty('{{projectTypes}}');
    });

    it('should have appropriate fonts for creative work', () => {
      expect(portfolioTemplate.customizations.fonts).toContain(
        'Playfair Display'
      );
      expect(portfolioTemplate.customizations.fonts).toContain('Merriweather');
    });
  });

  describe('Corporate Template', () => {
    const corporateTemplate = INDUSTRY_TEMPLATES.corporate;

    it('should have correct industry and template type', () => {
      expect(corporateTemplate.industry).toBe('corporate');
      expect(corporateTemplate.templateType).toBe('enterprise');
    });

    it('should have corporate-specific placeholders', () => {
      expect(corporateTemplate.placeholders).toHaveProperty('{{companyName}}');
      expect(corporateTemplate.placeholders).toHaveProperty('{{mainService}}');
      expect(corporateTemplate.placeholders).toHaveProperty(
        '{{valueProposition}}'
      );
      expect(corporateTemplate.placeholders).toHaveProperty(
        '{{officeLocations}}'
      );
    });

    it('should have professional additional sections', () => {
      expect(corporateTemplate.sections.additional).toContain(
        'client testimonials and case studies'
      );
      expect(corporateTemplate.sections.additional).toContain(
        'industry certifications and awards'
      );
      expect(corporateTemplate.sections.additional).toContain(
        'career opportunities page'
      );
    });
  });

  describe('Startup Template', () => {
    const startupTemplate = INDUSTRY_TEMPLATES.startup;

    it('should have correct industry and template type', () => {
      expect(startupTemplate.industry).toBe('startup');
      expect(startupTemplate.templateType).toBe('advanced');
    });

    it('should have startup-specific placeholders', () => {
      expect(startupTemplate.placeholders).toHaveProperty('{{startupName}}');
      expect(startupTemplate.placeholders).toHaveProperty('{{innovation}}');
      expect(startupTemplate.placeholders).toHaveProperty('{{solvesProblems}}');
      expect(startupTemplate.placeholders).toHaveProperty(
        '{{founderBackground}}'
      );
    });

    it('should have vibrant color schemes appropriate for startups', () => {
      expect(startupTemplate.customizations.colors).toContain('purple');
      expect(startupTemplate.customizations.colors).toContain('pink');
      expect(startupTemplate.customizations.colors).toContain('cyan');
    });
  });

  describe('Agency Template', () => {
    const agencyTemplate = INDUSTRY_TEMPLATES.agency;

    it('should have correct industry and template type', () => {
      expect(agencyTemplate.industry).toBe('agency');
      expect(agencyTemplate.templateType).toBe('advanced');
    });

    it('should have agency-specific placeholders', () => {
      expect(agencyTemplate.placeholders).toHaveProperty('{{agencyName}}');
      expect(agencyTemplate.placeholders).toHaveProperty(
        '{{creativeExpertise}}'
      );
      expect(agencyTemplate.placeholders).toHaveProperty('{{uniqueApproach}}');
      expect(agencyTemplate.placeholders).toHaveProperty('{{teamMembers}}');
    });

    it('should have creative additional sections', () => {
      expect(agencyTemplate.sections.additional).toContain(
        'portfolio gallery with case studies'
      );
      expect(agencyTemplate.sections.additional).toContain(
        'awards and industry recognition'
      );
      expect(agencyTemplate.sections.additional).toContain(
        'creative process explanation'
      );
    });

    it('should have creative fonts', () => {
      expect(agencyTemplate.customizations.fonts).toContain('Montserrat');
      expect(agencyTemplate.customizations.fonts).toContain('Playfair Display');
    });
  });

  describe('getIndustryTemplate', () => {
    it('should return template for existing industry', () => {
      const template = getIndustryTemplate('saas');
      expect(template).toBeDefined();
      expect(template?.industry).toBe('saas');
    });

    it('should return null for non-existent industry', () => {
      const template = getIndustryTemplate('nonexistent');
      expect(template).toBeNull();
    });

    it('should return correct template for each industry', () => {
      const industries = [
        'saas',
        'ecommerce',
        'portfolio',
        'corporate',
        'startup',
        'agency',
      ];
      industries.forEach((industry) => {
        const template = getIndustryTemplate(industry);
        expect(template).toBeDefined();
        expect(template?.industry).toBe(industry);
      });
    });
  });

  describe('getTemplateTypes', () => {
    it('should return all unique template types', () => {
      const types = getTemplateTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });

    it('should include expected template types', () => {
      const types = getTemplateTypes();
      expect(types).toContain('basic');
      expect(types).toContain('advanced');
      expect(types).toContain('enterprise');
    });

    it('should not include duplicate types', () => {
      const types = getTemplateTypes();
      const uniqueTypes = [...new Set(types)];
      expect(types).toEqual(uniqueTypes);
    });

    it('should return types in consistent order', () => {
      const types1 = getTemplateTypes();
      const types2 = getTemplateTypes();
      expect(types1).toEqual(types2);
    });
  });

  describe('Template Consistency', () => {
    it('should have consistent placeholder format across all templates', () => {
      Object.values(INDUSTRY_TEMPLATES).forEach((template) => {
        Object.keys(template.placeholders).forEach((placeholder) => {
          expect(placeholder).toMatch(/^{{.+}}$/);
        });
      });
    });

    it('should have non-empty descriptions for all placeholders', () => {
      Object.values(INDUSTRY_TEMPLATES).forEach((template) => {
        Object.values(template.placeholders).forEach((description) => {
          expect(typeof description).toBe('string');
          expect(description.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have at least 3 customization options for each category', () => {
      Object.values(INDUSTRY_TEMPLATES).forEach((template) => {
        expect(template.customizations.colors.length).toBeGreaterThanOrEqual(3);
        expect(template.customizations.fonts.length).toBeGreaterThanOrEqual(2);
        expect(template.customizations.layouts.length).toBeGreaterThanOrEqual(
          2
        );
      });
    });

    it('should have at least 3 additional sections for each template', () => {
      Object.values(INDUSTRY_TEMPLATES).forEach((template) => {
        expect(template.sections.additional.length).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
