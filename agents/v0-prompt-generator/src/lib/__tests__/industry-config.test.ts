import {
  INDUSTRY_CONFIGS,
  getAvailableIndustries,
  getIndustryDisplayNames,
} from '../industry-config';

describe('Industry Configuration', () => {
  describe('INDUSTRY_CONFIGS', () => {
    it('should have all required industries', () => {
      const expectedIndustries = [
        'saas',
        'ecommerce',
        'portfolio',
        'corporate',
        'startup',
        'agency',
      ];

      expectedIndustries.forEach((industry) => {
        expect(INDUSTRY_CONFIGS).toHaveProperty(industry);
      });
    });

    it('should have consistent structure for all industries', () => {
      Object.values(INDUSTRY_CONFIGS).forEach((config) => {
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('displayName');
        expect(config).toHaveProperty('commonFeatures');
        expect(config).toHaveProperty('technicalRequirements');
        expect(config).toHaveProperty('designPatterns');
        expect(config).toHaveProperty('examplePrompts');
        expect(config).toHaveProperty('colorSchemes');
        expect(config).toHaveProperty('layoutTypes');

        // Validate array properties
        expect(Array.isArray(config.commonFeatures)).toBe(true);
        expect(Array.isArray(config.technicalRequirements)).toBe(true);
        expect(Array.isArray(config.designPatterns)).toBe(true);
        expect(Array.isArray(config.examplePrompts)).toBe(true);
        expect(Array.isArray(config.colorSchemes)).toBe(true);
        expect(Array.isArray(config.layoutTypes)).toBe(true);

        // Validate minimum content
        expect(config.commonFeatures.length).toBeGreaterThan(0);
        expect(config.technicalRequirements.length).toBeGreaterThan(0);
        expect(config.designPatterns.length).toBeGreaterThan(0);
        expect(config.examplePrompts.length).toBeGreaterThan(0);
        expect(config.colorSchemes.length).toBeGreaterThan(0);
        expect(config.layoutTypes.length).toBeGreaterThan(0);
      });
    });

    it('should have proper string values for all properties', () => {
      Object.values(INDUSTRY_CONFIGS).forEach((config) => {
        expect(typeof config.name).toBe('string');
        expect(typeof config.displayName).toBe('string');
        expect(config.name.length).toBeGreaterThan(0);
        expect(config.displayName.length).toBeGreaterThan(0);

        // Validate array content
        config.commonFeatures.forEach((feature) => {
          expect(typeof feature).toBe('string');
          expect(feature.length).toBeGreaterThan(0);
        });

        config.technicalRequirements.forEach((requirement) => {
          expect(typeof requirement).toBe('string');
          expect(requirement.length).toBeGreaterThan(0);
        });

        config.designPatterns.forEach((pattern) => {
          expect(typeof pattern).toBe('string');
          expect(pattern.length).toBeGreaterThan(0);
        });

        config.examplePrompts.forEach((prompt) => {
          expect(typeof prompt).toBe('string');
          expect(prompt.length).toBeGreaterThan(0);
        });

        config.colorSchemes.forEach((scheme) => {
          expect(typeof scheme).toBe('string');
          expect(scheme.length).toBeGreaterThan(0);
        });

        config.layoutTypes.forEach((layout) => {
          expect(typeof layout).toBe('string');
          expect(layout.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('SaaS Industry Config', () => {
    const saasConfig = INDUSTRY_CONFIGS.saas;

    it('should have correct basic properties', () => {
      expect(saasConfig.name).toBe('SaaS');
      expect(saasConfig.displayName).toBe('Software as a Service');
    });

    it('should include essential SaaS features', () => {
      expect(saasConfig.commonFeatures).toContain(
        'User authentication and authorization'
      );
      expect(saasConfig.commonFeatures).toContain('Dashboard with analytics');
      expect(saasConfig.commonFeatures).toContain('Subscription management');
    });

    it('should include modern technical requirements', () => {
      expect(saasConfig.technicalRequirements).toContain(
        'NextJS 14 with App Router'
      );
      expect(saasConfig.technicalRequirements).toContain(
        'TypeScript for type safety'
      );
      expect(saasConfig.technicalRequirements).toContain(
        'Tailwind CSS for styling'
      );
    });

    it('should have appropriate design patterns', () => {
      expect(saasConfig.designPatterns).toContain(
        'Clean, professional interface'
      );
      expect(saasConfig.designPatterns).toContain(
        'Sidebar navigation with main content area'
      );
    });

    it('should have relevant color schemes', () => {
      expect(saasConfig.colorSchemes).toContain('blue-gray');
      expect(saasConfig.colorSchemes).toContain('indigo');
      expect(saasConfig.colorSchemes).toContain('slate');
    });

    it('should have appropriate layout types', () => {
      expect(saasConfig.layoutTypes).toContain('dashboard');
      expect(saasConfig.layoutTypes).toContain('sidebar-main');
      expect(saasConfig.layoutTypes).toContain('tabbed-interface');
    });
  });

  describe('E-commerce Industry Config', () => {
    const ecommerceConfig = INDUSTRY_CONFIGS.ecommerce;

    it('should have correct basic properties', () => {
      expect(ecommerceConfig.name).toBe('E-commerce');
      expect(ecommerceConfig.displayName).toBe('E-commerce & Retail');
    });

    it('should include essential e-commerce features', () => {
      expect(ecommerceConfig.commonFeatures).toContain(
        'Product catalog with search and filters'
      );
      expect(ecommerceConfig.commonFeatures).toContain(
        'Shopping cart and checkout process'
      );
      expect(ecommerceConfig.commonFeatures).toContain(
        'Payment processing integration'
      );
    });

    it('should include e-commerce specific technical requirements', () => {
      expect(ecommerceConfig.technicalRequirements).toContain(
        'Payment gateway integration (Stripe)'
      );
      expect(ecommerceConfig.technicalRequirements).toContain(
        'Product database with search capabilities'
      );
    });

    it('should have e-commerce appropriate color schemes', () => {
      expect(ecommerceConfig.colorSchemes).toContain('emerald');
      expect(ecommerceConfig.colorSchemes).toContain('orange');
      expect(ecommerceConfig.colorSchemes).toContain('red');
    });
  });

  describe('Portfolio Industry Config', () => {
    const portfolioConfig = INDUSTRY_CONFIGS.portfolio;

    it('should have correct basic properties', () => {
      expect(portfolioConfig.name).toBe('Portfolio');
      expect(portfolioConfig.displayName).toBe('Portfolio & Personal');
    });

    it('should include essential portfolio features', () => {
      expect(portfolioConfig.commonFeatures).toContain(
        'About section with personal story'
      );
      expect(portfolioConfig.commonFeatures).toContain(
        'Project showcase with case studies'
      );
      expect(portfolioConfig.commonFeatures).toContain(
        'Skills and expertise display'
      );
    });

    it('should have neutral color schemes appropriate for portfolios', () => {
      expect(portfolioConfig.colorSchemes).toContain('neutral');
      expect(portfolioConfig.colorSchemes).toContain('stone');
      expect(portfolioConfig.colorSchemes).toContain('zinc');
    });
  });

  describe('getAvailableIndustries', () => {
    it('should return array of industry keys', () => {
      const industries = getAvailableIndustries();
      expect(Array.isArray(industries)).toBe(true);
      expect(industries.length).toBeGreaterThan(0);
    });

    it('should include all expected industries', () => {
      const industries = getAvailableIndustries();
      const expectedIndustries = [
        'saas',
        'ecommerce',
        'portfolio',
        'corporate',
        'startup',
        'agency',
      ];

      expectedIndustries.forEach((industry) => {
        expect(industries).toContain(industry);
      });
    });

    it('should return consistent results', () => {
      const industries1 = getAvailableIndustries();
      const industries2 = getAvailableIndustries();
      expect(industries1).toEqual(industries2);
    });
  });

  describe('getIndustryDisplayNames', () => {
    it('should return object with display names', () => {
      const displayNames = getIndustryDisplayNames();
      expect(typeof displayNames).toBe('object');
      expect(displayNames).not.toBeNull();
    });

    it('should have display names for all industries', () => {
      const displayNames = getIndustryDisplayNames();
      const industries = getAvailableIndustries();

      industries.forEach((industry) => {
        expect(displayNames).toHaveProperty(industry);
        expect(typeof displayNames[industry]).toBe('string');
        expect(displayNames[industry].length).toBeGreaterThan(0);
      });
    });

    it('should have correct display names', () => {
      const displayNames = getIndustryDisplayNames();
      expect(displayNames.saas).toBe('Software as a Service');
      expect(displayNames.ecommerce).toBe('E-commerce & Retail');
      expect(displayNames.portfolio).toBe('Portfolio & Personal');
      expect(displayNames.corporate).toBe('Corporate & Business');
      expect(displayNames.startup).toBe('Startup & Innovation');
      expect(displayNames.agency).toBe('Creative Agency');
    });

    it('should return consistent results', () => {
      const displayNames1 = getIndustryDisplayNames();
      const displayNames2 = getIndustryDisplayNames();
      expect(displayNames1).toEqual(displayNames2);
    });
  });

  describe('Industry Config Validation', () => {
    it('should have unique display names', () => {
      const displayNames = Object.values(INDUSTRY_CONFIGS).map(
        (config) => config.displayName
      );
      const uniqueDisplayNames = [...new Set(displayNames)];
      expect(displayNames).toEqual(uniqueDisplayNames);
    });

    it('should have unique names', () => {
      const names = Object.values(INDUSTRY_CONFIGS).map(
        (config) => config.name
      );
      const uniqueNames = [...new Set(names)];
      expect(names).toEqual(uniqueNames);
    });

    it('should have at least 5 common features per industry', () => {
      Object.values(INDUSTRY_CONFIGS).forEach((config) => {
        expect(config.commonFeatures.length).toBeGreaterThanOrEqual(5);
      });
    });

    it('should have at least 5 technical requirements per industry', () => {
      Object.values(INDUSTRY_CONFIGS).forEach((config) => {
        expect(config.technicalRequirements.length).toBeGreaterThanOrEqual(5);
      });
    });

    it('should have at least 5 design patterns per industry', () => {
      Object.values(INDUSTRY_CONFIGS).forEach((config) => {
        expect(config.designPatterns.length).toBeGreaterThanOrEqual(5);
      });
    });

    it('should have at least 2 example prompts per industry', () => {
      Object.values(INDUSTRY_CONFIGS).forEach((config) => {
        expect(config.examplePrompts.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have at least 2 color schemes per industry', () => {
      Object.values(INDUSTRY_CONFIGS).forEach((config) => {
        expect(config.colorSchemes.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have at least 2 layout types per industry', () => {
      Object.values(INDUSTRY_CONFIGS).forEach((config) => {
        expect(config.layoutTypes.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
