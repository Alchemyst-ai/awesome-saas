import {
  INDUSTRY_FEATURE_MAPPINGS,
  getIndustryFeatureMapping,
  getRequiredFeatures,
  getOptionalFeatures,
  getTechnicalStack,
  getDesignGuidelines,
} from '../feature-mappings';

describe('Feature Mappings', () => {
  describe('INDUSTRY_FEATURE_MAPPINGS', () => {
    it('should have mappings for all expected industries', () => {
      const expectedIndustries = [
        'saas',
        'ecommerce',
        'portfolio',
        'corporate',
        'startup',
        'agency',
      ];

      expectedIndustries.forEach((industry) => {
        expect(INDUSTRY_FEATURE_MAPPINGS).toHaveProperty(industry);
      });
    });

    it('should have consistent structure for all industry mappings', () => {
      Object.values(INDUSTRY_FEATURE_MAPPINGS).forEach((mapping) => {
        expect(mapping).toHaveProperty('industry');
        expect(mapping).toHaveProperty('requiredFeatures');
        expect(mapping).toHaveProperty('optionalFeatures');
        expect(mapping).toHaveProperty('technicalStack');
        expect(mapping).toHaveProperty('designGuidelines');

        // Validate array properties
        expect(Array.isArray(mapping.requiredFeatures)).toBe(true);
        expect(Array.isArray(mapping.optionalFeatures)).toBe(true);

        // Validate technical stack structure
        expect(mapping.technicalStack).toHaveProperty('required');
        expect(mapping.technicalStack).toHaveProperty('recommended');
        expect(mapping.technicalStack).toHaveProperty('optional');
        expect(Array.isArray(mapping.technicalStack.required)).toBe(true);
        expect(Array.isArray(mapping.technicalStack.recommended)).toBe(true);
        expect(Array.isArray(mapping.technicalStack.optional)).toBe(true);

        // Validate design guidelines structure
        expect(mapping.designGuidelines).toHaveProperty('colorPalette');
        expect(mapping.designGuidelines).toHaveProperty('layoutPreferences');
        expect(mapping.designGuidelines).toHaveProperty('componentTypes');
        expect(Array.isArray(mapping.designGuidelines.colorPalette)).toBe(true);
        expect(Array.isArray(mapping.designGuidelines.layoutPreferences)).toBe(
          true
        );
        expect(Array.isArray(mapping.designGuidelines.componentTypes)).toBe(
          true
        );

        // Validate minimum content requirements
        expect(mapping.requiredFeatures.length).toBeGreaterThanOrEqual(3);
        expect(mapping.optionalFeatures.length).toBeGreaterThanOrEqual(5);
        expect(mapping.technicalStack.required.length).toBeGreaterThanOrEqual(
          3
        );
        expect(
          mapping.technicalStack.recommended.length
        ).toBeGreaterThanOrEqual(3);
        expect(
          mapping.designGuidelines.colorPalette.length
        ).toBeGreaterThanOrEqual(3);
        expect(
          mapping.designGuidelines.layoutPreferences.length
        ).toBeGreaterThanOrEqual(2);
        expect(
          mapping.designGuidelines.componentTypes.length
        ).toBeGreaterThanOrEqual(4);
      });
    });

    it('should have non-empty string values for all features', () => {
      Object.values(INDUSTRY_FEATURE_MAPPINGS).forEach((mapping) => {
        expect(typeof mapping.industry).toBe('string');
        expect(mapping.industry.length).toBeGreaterThan(0);

        mapping.requiredFeatures.forEach((feature) => {
          expect(typeof feature).toBe('string');
          expect(feature.length).toBeGreaterThan(0);
        });

        mapping.optionalFeatures.forEach((feature) => {
          expect(typeof feature).toBe('string');
          expect(feature.length).toBeGreaterThan(0);
        });

        mapping.technicalStack.required.forEach((tech) => {
          expect(typeof tech).toBe('string');
          expect(tech.length).toBeGreaterThan(0);
        });

        mapping.technicalStack.recommended.forEach((tech) => {
          expect(typeof tech).toBe('string');
          expect(tech.length).toBeGreaterThan(0);
        });

        mapping.technicalStack.optional.forEach((tech) => {
          expect(typeof tech).toBe('string');
          expect(tech.length).toBeGreaterThan(0);
        });

        mapping.designGuidelines.colorPalette.forEach((color) => {
          expect(typeof color).toBe('string');
          expect(color.length).toBeGreaterThan(0);
        });

        mapping.designGuidelines.layoutPreferences.forEach((layout) => {
          expect(typeof layout).toBe('string');
          expect(layout.length).toBeGreaterThan(0);
        });

        mapping.designGuidelines.componentTypes.forEach((component) => {
          expect(typeof component).toBe('string');
          expect(component.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('SaaS Industry Mapping', () => {
    const saasMapping = INDUSTRY_FEATURE_MAPPINGS.saas;

    it('should have correct industry identifier', () => {
      expect(saasMapping.industry).toBe('saas');
    });

    it('should include essential SaaS required features', () => {
      expect(saasMapping.requiredFeatures).toContain(
        'User authentication and login system'
      );
      expect(saasMapping.requiredFeatures).toContain(
        'Dashboard with key metrics and analytics'
      );
      expect(saasMapping.requiredFeatures).toContain(
        'User profile and account management'
      );
    });

    it('should include relevant SaaS optional features', () => {
      expect(saasMapping.optionalFeatures).toContain(
        'API documentation section'
      );
      expect(saasMapping.optionalFeatures).toContain('Customer testimonials');
      expect(saasMapping.optionalFeatures).toContain(
        'Free trial or demo signup'
      );
    });

    it('should have appropriate technical stack', () => {
      expect(saasMapping.technicalStack.required).toContain(
        'NextJS 14 with App Router'
      );
      expect(saasMapping.technicalStack.required).toContain(
        'TypeScript for type safety'
      );
      expect(saasMapping.technicalStack.recommended).toContain(
        'NextAuth.js for authentication'
      );
      expect(saasMapping.technicalStack.recommended).toContain(
        'Stripe for payment processing'
      );
    });

    it('should have professional design guidelines', () => {
      expect(saasMapping.designGuidelines.colorPalette).toContain('blue');
      expect(saasMapping.designGuidelines.colorPalette).toContain('indigo');
      expect(saasMapping.designGuidelines.layoutPreferences).toContain(
        'dashboard-style'
      );
      expect(saasMapping.designGuidelines.componentTypes).toContain(
        'dashboard-cards'
      );
    });
  });

  describe('E-commerce Industry Mapping', () => {
    const ecommerceMapping = INDUSTRY_FEATURE_MAPPINGS.ecommerce;

    it('should have correct industry identifier', () => {
      expect(ecommerceMapping.industry).toBe('ecommerce');
    });

    it('should include essential e-commerce required features', () => {
      expect(ecommerceMapping.requiredFeatures).toContain(
        'Product catalog with search and filtering'
      );
      expect(ecommerceMapping.requiredFeatures).toContain(
        'Shopping cart functionality'
      );
      expect(ecommerceMapping.requiredFeatures).toContain(
        'Checkout process with payment integration'
      );
    });

    it('should include relevant e-commerce optional features', () => {
      expect(ecommerceMapping.optionalFeatures).toContain(
        'Product reviews and ratings'
      );
      expect(ecommerceMapping.optionalFeatures).toContain(
        'Wishlist or favorites functionality'
      );
      expect(ecommerceMapping.optionalFeatures).toContain(
        'Product recommendations'
      );
    });

    it('should have e-commerce specific technical stack', () => {
      expect(ecommerceMapping.technicalStack.recommended).toContain(
        'Stripe or PayPal for payments'
      );
      expect(ecommerceMapping.technicalStack.recommended).toContain(
        'Zustand for cart state management'
      );
      expect(ecommerceMapping.technicalStack.optional).toContain(
        'Algolia for product search'
      );
    });

    it('should have commerce-appropriate design guidelines', () => {
      expect(ecommerceMapping.designGuidelines.colorPalette).toContain(
        'emerald'
      );
      expect(ecommerceMapping.designGuidelines.layoutPreferences).toContain(
        'grid-catalog'
      );
      expect(ecommerceMapping.designGuidelines.componentTypes).toContain(
        'product-cards'
      );
      expect(ecommerceMapping.designGuidelines.componentTypes).toContain(
        'shopping-cart'
      );
    });
  });

  describe('Portfolio Industry Mapping', () => {
    const portfolioMapping = INDUSTRY_FEATURE_MAPPINGS.portfolio;

    it('should have correct industry identifier', () => {
      expect(portfolioMapping.industry).toBe('portfolio');
    });

    it('should include essential portfolio required features', () => {
      expect(portfolioMapping.requiredFeatures).toContain(
        'Personal introduction and about section'
      );
      expect(portfolioMapping.requiredFeatures).toContain(
        'Project showcase with descriptions'
      );
      expect(portfolioMapping.requiredFeatures).toContain(
        'Skills and expertise display'
      );
    });

    it('should include relevant portfolio optional features', () => {
      expect(portfolioMapping.optionalFeatures).toContain(
        'Resume or CV download'
      );
      expect(portfolioMapping.optionalFeatures).toContain(
        'Blog or articles section'
      );
      expect(portfolioMapping.optionalFeatures).toContain(
        'Testimonials from clients'
      );
    });

    it('should have portfolio-specific technical stack', () => {
      expect(portfolioMapping.technicalStack.required).toContain(
        'NextJS 14 with static generation'
      );
      expect(portfolioMapping.technicalStack.recommended).toContain(
        'MDX for blog content'
      );
      expect(portfolioMapping.technicalStack.recommended).toContain(
        'Framer Motion for smooth animations'
      );
    });

    it('should have neutral design guidelines appropriate for portfolios', () => {
      expect(portfolioMapping.designGuidelines.colorPalette).toContain(
        'neutral'
      );
      expect(portfolioMapping.designGuidelines.colorPalette).toContain('stone');
      expect(portfolioMapping.designGuidelines.layoutPreferences).toContain(
        'masonry-grid'
      );
      expect(portfolioMapping.designGuidelines.componentTypes).toContain(
        'project-cards'
      );
    });
  });

  describe('Corporate Industry Mapping', () => {
    const corporateMapping = INDUSTRY_FEATURE_MAPPINGS.corporate;

    it('should have correct industry identifier', () => {
      expect(corporateMapping.industry).toBe('corporate');
    });

    it('should include essential corporate required features', () => {
      expect(corporateMapping.requiredFeatures).toContain(
        'Company overview and mission statement'
      );
      expect(corporateMapping.requiredFeatures).toContain(
        'Team member profiles and leadership'
      );
      expect(corporateMapping.requiredFeatures).toContain(
        'Professional company branding'
      );
    });

    it('should include relevant corporate optional features', () => {
      expect(corporateMapping.optionalFeatures).toContain(
        'Client testimonials and case studies'
      );
      expect(corporateMapping.optionalFeatures).toContain(
        'Career opportunities and job listings'
      );
      expect(corporateMapping.optionalFeatures).toContain(
        'Industry certifications'
      );
    });

    it('should have enterprise-appropriate technical stack', () => {
      expect(corporateMapping.technicalStack.required).toContain(
        'TypeScript for enterprise reliability'
      );
      expect(corporateMapping.technicalStack.recommended).toContain(
        'Sanity or Strapi for content management'
      );
      expect(corporateMapping.technicalStack.optional).toContain(
        'Next-intl for multi-language support'
      );
    });

    it('should have professional design guidelines', () => {
      expect(corporateMapping.designGuidelines.colorPalette).toContain('blue');
      expect(corporateMapping.designGuidelines.colorPalette).toContain('gray');
      expect(corporateMapping.designGuidelines.layoutPreferences).toContain(
        'corporate-standard'
      );
      expect(corporateMapping.designGuidelines.componentTypes).toContain(
        'team-grids'
      );
    });
  });

  describe('Startup Industry Mapping', () => {
    const startupMapping = INDUSTRY_FEATURE_MAPPINGS.startup;

    it('should have correct industry identifier', () => {
      expect(startupMapping.industry).toBe('startup');
    });

    it('should include essential startup required features', () => {
      expect(startupMapping.requiredFeatures).toContain(
        'Product or service introduction'
      );
      expect(startupMapping.requiredFeatures).toContain(
        'Problem and solution explanation'
      );
      expect(startupMapping.requiredFeatures).toContain(
        'Founder and team information'
      );
    });

    it('should include relevant startup optional features', () => {
      expect(startupMapping.optionalFeatures).toContain(
        'Early access or beta signup'
      );
      expect(startupMapping.optionalFeatures).toContain(
        'Investor pitch and funding information'
      );
      expect(startupMapping.optionalFeatures).toContain(
        'Product roadmap and timeline'
      );
    });

    it('should have startup-appropriate technical stack', () => {
      expect(startupMapping.technicalStack.required).toContain(
        'NextJS 14 for fast development'
      );
      expect(startupMapping.technicalStack.recommended).toContain(
        'Framer Motion for engaging animations'
      );
      expect(startupMapping.technicalStack.optional).toContain(
        'Posthog for product analytics'
      );
    });

    it('should have vibrant design guidelines appropriate for startups', () => {
      expect(startupMapping.designGuidelines.colorPalette).toContain('purple');
      expect(startupMapping.designGuidelines.colorPalette).toContain('pink');
      expect(startupMapping.designGuidelines.layoutPreferences).toContain(
        'landing-focused'
      );
      expect(startupMapping.designGuidelines.componentTypes).toContain(
        'founder-stories'
      );
    });
  });

  describe('Agency Industry Mapping', () => {
    const agencyMapping = INDUSTRY_FEATURE_MAPPINGS.agency;

    it('should have correct industry identifier', () => {
      expect(agencyMapping.industry).toBe('agency');
    });

    it('should include essential agency required features', () => {
      expect(agencyMapping.requiredFeatures).toContain(
        'Portfolio of client work and projects'
      );
      expect(agencyMapping.requiredFeatures).toContain(
        'Creative team profiles and backgrounds'
      );
      expect(agencyMapping.requiredFeatures).toContain(
        'Client testimonials and case studies'
      );
    });

    it('should include relevant agency optional features', () => {
      expect(agencyMapping.optionalFeatures).toContain(
        'Awards and industry recognition'
      );
      expect(agencyMapping.optionalFeatures).toContain(
        'Creative process explanation'
      );
      expect(agencyMapping.optionalFeatures).toContain(
        'Behind-the-scenes content'
      );
    });

    it('should have creative-focused technical stack', () => {
      expect(agencyMapping.technicalStack.required).toContain(
        'NextJS 14 for creative flexibility'
      );
      expect(agencyMapping.technicalStack.recommended).toContain(
        'Framer Motion for creative animations'
      );
      expect(agencyMapping.technicalStack.optional).toContain(
        'Three.js for 3D creative elements'
      );
    });

    it('should have creative design guidelines', () => {
      expect(agencyMapping.designGuidelines.colorPalette).toContain('rose');
      expect(agencyMapping.designGuidelines.colorPalette).toContain('amber');
      expect(agencyMapping.designGuidelines.layoutPreferences).toContain(
        'portfolio-heavy'
      );
      expect(agencyMapping.designGuidelines.componentTypes).toContain(
        'portfolio-galleries'
      );
    });
  });

  describe('Utility Functions', () => {
    describe('getIndustryFeatureMapping', () => {
      it('should return mapping for existing industry', () => {
        const mapping = getIndustryFeatureMapping('saas');
        expect(mapping).toBeDefined();
        expect(mapping?.industry).toBe('saas');
      });

      it('should return null for non-existing industry', () => {
        const mapping = getIndustryFeatureMapping('nonexistent');
        expect(mapping).toBeNull();
      });

      it('should return correct mapping for each industry', () => {
        const industries = [
          'saas',
          'ecommerce',
          'portfolio',
          'corporate',
          'startup',
          'agency',
        ];
        industries.forEach((industry) => {
          const mapping = getIndustryFeatureMapping(industry);
          expect(mapping).toBeDefined();
          expect(mapping?.industry).toBe(industry);
        });
      });
    });

    describe('getRequiredFeatures', () => {
      it('should return required features for existing industry', () => {
        const features = getRequiredFeatures('saas');
        expect(Array.isArray(features)).toBe(true);
        expect(features.length).toBeGreaterThan(0);
        expect(features).toContain('User authentication and login system');
      });

      it('should return empty array for non-existing industry', () => {
        const features = getRequiredFeatures('nonexistent');
        expect(features).toEqual([]);
      });

      it('should return different features for different industries', () => {
        const saasFeatures = getRequiredFeatures('saas');
        const ecommerceFeatures = getRequiredFeatures('ecommerce');
        expect(saasFeatures).not.toEqual(ecommerceFeatures);
      });
    });

    describe('getOptionalFeatures', () => {
      it('should return optional features for existing industry', () => {
        const features = getOptionalFeatures('saas');
        expect(Array.isArray(features)).toBe(true);
        expect(features.length).toBeGreaterThan(0);
        expect(features).toContain('API documentation section');
      });

      it('should return empty array for non-existing industry', () => {
        const features = getOptionalFeatures('nonexistent');
        expect(features).toEqual([]);
      });

      it('should have more optional features than required features', () => {
        const requiredFeatures = getRequiredFeatures('saas');
        const optionalFeatures = getOptionalFeatures('saas');
        expect(optionalFeatures.length).toBeGreaterThan(
          requiredFeatures.length
        );
      });
    });

    describe('getTechnicalStack', () => {
      it('should return technical stack for existing industry', () => {
        const stack = getTechnicalStack('saas');
        expect(stack).toBeDefined();
        expect(stack).toHaveProperty('required');
        expect(stack).toHaveProperty('recommended');
        expect(stack).toHaveProperty('optional');
        expect(Array.isArray(stack?.required)).toBe(true);
        expect(Array.isArray(stack?.recommended)).toBe(true);
        expect(Array.isArray(stack?.optional)).toBe(true);
      });

      it('should return null for non-existing industry', () => {
        const stack = getTechnicalStack('nonexistent');
        expect(stack).toBeNull();
      });

      it('should include NextJS in required stack for all industries', () => {
        const industries = [
          'saas',
          'ecommerce',
          'portfolio',
          'corporate',
          'startup',
          'agency',
        ];
        industries.forEach((industry) => {
          const stack = getTechnicalStack(industry);
          expect(stack?.required.some((tech) => tech.includes('NextJS'))).toBe(
            true
          );
        });
      });
    });

    describe('getDesignGuidelines', () => {
      it('should return design guidelines for existing industry', () => {
        const guidelines = getDesignGuidelines('saas');
        expect(guidelines).toBeDefined();
        expect(guidelines).toHaveProperty('colorPalette');
        expect(guidelines).toHaveProperty('layoutPreferences');
        expect(guidelines).toHaveProperty('componentTypes');
        expect(Array.isArray(guidelines?.colorPalette)).toBe(true);
        expect(Array.isArray(guidelines?.layoutPreferences)).toBe(true);
        expect(Array.isArray(guidelines?.componentTypes)).toBe(true);
      });

      it('should return null for non-existing industry', () => {
        const guidelines = getDesignGuidelines('nonexistent');
        expect(guidelines).toBeNull();
      });

      it('should have different color palettes for different industries', () => {
        const saasGuidelines = getDesignGuidelines('saas');
        const startupGuidelines = getDesignGuidelines('startup');
        expect(saasGuidelines?.colorPalette).not.toEqual(
          startupGuidelines?.colorPalette
        );
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have unique required features within each industry', () => {
      Object.values(INDUSTRY_FEATURE_MAPPINGS).forEach((mapping) => {
        const uniqueFeatures = [...new Set(mapping.requiredFeatures)];
        expect(mapping.requiredFeatures).toEqual(uniqueFeatures);
      });
    });

    it('should have unique optional features within each industry', () => {
      Object.values(INDUSTRY_FEATURE_MAPPINGS).forEach((mapping) => {
        const uniqueFeatures = [...new Set(mapping.optionalFeatures)];
        expect(mapping.optionalFeatures).toEqual(uniqueFeatures);
      });
    });

    it('should not have overlapping required and optional features', () => {
      Object.values(INDUSTRY_FEATURE_MAPPINGS).forEach((mapping) => {
        const requiredSet = new Set(mapping.requiredFeatures);
        const optionalSet = new Set(mapping.optionalFeatures);
        const intersection = [...requiredSet].filter((x) => optionalSet.has(x));
        expect(intersection).toEqual([]);
      });
    });

    it('should have unique technical stack items within each category', () => {
      Object.values(INDUSTRY_FEATURE_MAPPINGS).forEach((mapping) => {
        const uniqueRequired = [...new Set(mapping.technicalStack.required)];
        const uniqueRecommended = [
          ...new Set(mapping.technicalStack.recommended),
        ];
        const uniqueOptional = [...new Set(mapping.technicalStack.optional)];

        expect(mapping.technicalStack.required).toEqual(uniqueRequired);
        expect(mapping.technicalStack.recommended).toEqual(uniqueRecommended);
        expect(mapping.technicalStack.optional).toEqual(uniqueOptional);
      });
    });

    it('should have unique color palette items', () => {
      Object.values(INDUSTRY_FEATURE_MAPPINGS).forEach((mapping) => {
        const uniqueColors = [
          ...new Set(mapping.designGuidelines.colorPalette),
        ];
        expect(mapping.designGuidelines.colorPalette).toEqual(uniqueColors);
      });
    });

    it('should have unique component types', () => {
      Object.values(INDUSTRY_FEATURE_MAPPINGS).forEach((mapping) => {
        const uniqueComponents = [
          ...new Set(mapping.designGuidelines.componentTypes),
        ];
        expect(mapping.designGuidelines.componentTypes).toEqual(
          uniqueComponents
        );
      });
    });
  });
});
