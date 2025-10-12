import { IndustryFeatureMapping } from '@/types/industry';

/**
 * Industry-specific feature mappings and technical requirements
 * Maps industries to their required features, tech stacks, and design guidelines
 */
export const INDUSTRY_FEATURE_MAPPINGS: Record<string, IndustryFeatureMapping> =
  {
    saas: {
      industry: 'saas',
      requiredFeatures: [
        'User authentication and login system',
        'Dashboard with key metrics and analytics',
        'User profile and account management',
        'Subscription or pricing information',
        'Contact form or support system',
      ],
      optionalFeatures: [
        'API documentation section',
        'Integration showcase',
        'Customer testimonials',
        'Blog or resources section',
        'Team member profiles',
        'Security and compliance information',
        'Free trial or demo signup',
        'Live chat support',
        'Knowledge base or help center',
        'Notification system',
      ],
      technicalStack: {
        required: [
          'NextJS 14 with App Router',
          'TypeScript for type safety',
          'Tailwind CSS for styling',
          'React Hook Form for form handling',
        ],
        recommended: [
          'NextAuth.js for authentication',
          'Prisma or Supabase for database',
          'Zustand or Redux for state management',
          'React Query for API calls',
          'Stripe for payment processing',
          'Resend or SendGrid for emails',
        ],
        optional: [
          'Framer Motion for animations',
          'Chart.js or Recharts for analytics',
          'Socket.io for real-time features',
          'Algolia for search functionality',
          'Sentry for error monitoring',
          'Vercel Analytics for tracking',
        ],
      },
      designGuidelines: {
        colorPalette: ['blue', 'indigo', 'slate', 'gray', 'neutral'],
        layoutPreferences: [
          'dashboard-style',
          'sidebar-navigation',
          'card-based-layout',
        ],
        componentTypes: [
          'navigation-sidebar',
          'dashboard-cards',
          'data-tables',
          'modal-dialogs',
          'form-components',
          'chart-components',
          'notification-toasts',
          'loading-skeletons',
        ],
      },
    },

    ecommerce: {
      industry: 'ecommerce',
      requiredFeatures: [
        'Product catalog with search and filtering',
        'Shopping cart functionality',
        'Product detail pages with images',
        'Checkout process with payment integration',
        'User account creation and login',
      ],
      optionalFeatures: [
        'Product reviews and ratings',
        'Wishlist or favorites functionality',
        'Order tracking and history',
        'Promotional banners and discounts',
        'Newsletter signup',
        'Customer support chat',
        'Product recommendations',
        'Inventory status indicators',
        'Social media integration',
        'Multi-language support',
      ],
      technicalStack: {
        required: [
          'NextJS 14 with App Router',
          'TypeScript for reliability',
          'Tailwind CSS for responsive design',
          'React Hook Form for checkout forms',
        ],
        recommended: [
          'Stripe or PayPal for payments',
          'Prisma with PostgreSQL for product data',
          'NextAuth.js for user accounts',
          'Zustand for cart state management',
          'Next.js Image for product photos',
          'React Query for product fetching',
        ],
        optional: [
          'Algolia for product search',
          'Framer Motion for product animations',
          'React Select for filtering',
          'React Slick for product carousels',
          'Yup for form validation',
          'React Hot Toast for notifications',
        ],
      },
      designGuidelines: {
        colorPalette: ['emerald', 'orange', 'red', 'blue', 'rose'],
        layoutPreferences: [
          'grid-catalog',
          'hero-featured',
          'category-navigation',
        ],
        componentTypes: [
          'product-cards',
          'image-galleries',
          'filter-sidebars',
          'shopping-cart',
          'checkout-forms',
          'product-carousels',
          'breadcrumb-navigation',
          'review-components',
        ],
      },
    },

    portfolio: {
      industry: 'portfolio',
      requiredFeatures: [
        'Personal introduction and about section',
        'Project showcase with descriptions',
        'Contact information and form',
        'Skills and expertise display',
        'Professional photo or avatar',
      ],
      optionalFeatures: [
        'Resume or CV download',
        'Blog or articles section',
        'Testimonials from clients',
        'Social media links',
        'Photo gallery or media showcase',
        'Professional timeline',
        'Service offerings',
        'Client logos or work history',
        'Awards and certifications',
        'Speaking engagements or events',
      ],
      technicalStack: {
        required: [
          'NextJS 14 with static generation',
          'TypeScript for maintainability',
          'Tailwind CSS for custom styling',
          'Next.js Image for portfolio images',
        ],
        recommended: [
          'MDX for blog content',
          'React Hook Form for contact form',
          'Framer Motion for smooth animations',
          'Next SEO for search optimization',
          'Resend for contact form emails',
          'React Icons for social links',
        ],
        optional: [
          'Sanity or Contentful for CMS',
          'React Intersection Observer for scroll animations',
          'React Masonry CSS for portfolio grid',
          'React PDF for resume generation',
          'Google Analytics for visitor tracking',
          'Vercel Analytics for performance',
        ],
      },
      designGuidelines: {
        colorPalette: ['neutral', 'stone', 'zinc', 'slate', 'gray'],
        layoutPreferences: [
          'hero-centered',
          'masonry-grid',
          'single-page-scroll',
        ],
        componentTypes: [
          'hero-sections',
          'project-cards',
          'image-galleries',
          'contact-forms',
          'skill-badges',
          'timeline-components',
          'testimonial-cards',
          'social-links',
        ],
      },
    },

    corporate: {
      industry: 'corporate',
      requiredFeatures: [
        'Company overview and mission statement',
        'Services or products information',
        'Team member profiles and leadership',
        'Contact information and office locations',
        'Professional company branding',
      ],
      optionalFeatures: [
        'Client testimonials and case studies',
        'News and press releases',
        'Career opportunities and job listings',
        'Investor relations information',
        'Corporate social responsibility',
        'Partnership information',
        'Industry certifications',
        'Awards and recognition',
        'Event calendar',
        'Resource downloads',
      ],
      technicalStack: {
        required: [
          'NextJS 14 with App Router',
          'TypeScript for enterprise reliability',
          'Tailwind CSS for consistent branding',
          'React Hook Form for contact forms',
        ],
        recommended: [
          'Sanity or Strapi for content management',
          'Next SEO for business visibility',
          'React Query for data fetching',
          'Next.js Image for team photos',
          'Resend for business inquiries',
          'React Icons for professional icons',
        ],
        optional: [
          'Next-intl for multi-language support',
          'React Calendar for events',
          'React PDF for document generation',
          'Framer Motion for subtle animations',
          'Google Maps integration for locations',
          'HubSpot or Salesforce integration',
        ],
      },
      designGuidelines: {
        colorPalette: ['blue', 'gray', 'slate', 'stone', 'neutral'],
        layoutPreferences: [
          'corporate-standard',
          'service-focused',
          'team-centric',
        ],
        componentTypes: [
          'header-navigation',
          'hero-banners',
          'service-cards',
          'team-grids',
          'testimonial-sections',
          'contact-forms',
          'footer-comprehensive',
          'news-listings',
        ],
      },
    },

    startup: {
      industry: 'startup',
      requiredFeatures: [
        'Product or service introduction',
        'Problem and solution explanation',
        'Founder and team information',
        'Contact and partnership opportunities',
        'Company vision and mission',
      ],
      optionalFeatures: [
        'Early access or beta signup',
        'Investor pitch and funding information',
        'Product roadmap and timeline',
        'User testimonials or early feedback',
        'Press coverage and media mentions',
        'Job openings and company culture',
        'Community and social links',
        'Blog or thought leadership',
        'Partnership opportunities',
        'Demo or product preview',
      ],
      technicalStack: {
        required: [
          'NextJS 14 for fast development',
          'TypeScript for scalable codebase',
          'Tailwind CSS for rapid styling',
          'React Hook Form for signup forms',
        ],
        recommended: [
          'Framer Motion for engaging animations',
          'Next SEO for organic discovery',
          'React Query for API integration',
          'Zustand for simple state management',
          'Resend for email capture',
          'Vercel Analytics for growth tracking',
        ],
        optional: [
          'Stripe for early payment processing',
          'Supabase for user management',
          'React Hot Toast for notifications',
          'React Intersection Observer for scroll effects',
          'Posthog for product analytics',
          'Intercom for customer communication',
        ],
      },
      designGuidelines: {
        colorPalette: ['purple', 'pink', 'cyan', 'indigo', 'violet'],
        layoutPreferences: ['landing-focused', 'story-driven', 'demo-centric'],
        componentTypes: [
          'hero-sections',
          'feature-highlights',
          'founder-stories',
          'signup-forms',
          'testimonial-cards',
          'roadmap-timelines',
          'press-mentions',
          'team-showcases',
        ],
      },
    },

    agency: {
      industry: 'agency',
      requiredFeatures: [
        'Portfolio of client work and projects',
        'Service offerings and expertise areas',
        'Creative team profiles and backgrounds',
        'Client testimonials and case studies',
        'Project inquiry and contact form',
      ],
      optionalFeatures: [
        'Awards and industry recognition',
        'Creative process explanation',
        'Blog with industry insights',
        'Client logo showcase',
        'Behind-the-scenes content',
        'Workshop or event information',
        'Partnership opportunities',
        'Resource downloads',
        'Social media integration',
        'Office culture and workspace',
      ],
      technicalStack: {
        required: [
          'NextJS 14 for creative flexibility',
          'TypeScript for project maintainability',
          'Tailwind CSS for custom designs',
          'Next.js Image for portfolio optimization',
        ],
        recommended: [
          'Framer Motion for creative animations',
          'Sanity for portfolio content management',
          'React Hook Form for project inquiries',
          'Next SEO for creative industry keywords',
          'React Masonry CSS for portfolio layouts',
          'React Icons for creative elements',
        ],
        optional: [
          'Three.js for 3D creative elements',
          'React Spring for advanced animations',
          'React Player for video portfolios',
          'React Lightbox for image galleries',
          'Lottie React for micro-animations',
          'React Parallax for creative scrolling',
        ],
      },
      designGuidelines: {
        colorPalette: ['rose', 'amber', 'teal', 'purple', 'orange'],
        layoutPreferences: [
          'portfolio-heavy',
          'creative-showcase',
          'process-focused',
        ],
        componentTypes: [
          'portfolio-galleries',
          'project-showcases',
          'team-creative-cards',
          'service-highlights',
          'testimonial-creative',
          'process-timelines',
          'award-displays',
          'contact-creative',
        ],
      },
    },
  };

/**
 * Get feature mapping for specific industry
 */
export const getIndustryFeatureMapping = (
  industry: string
): IndustryFeatureMapping | null => {
  return INDUSTRY_FEATURE_MAPPINGS[industry] || null;
};

/**
 * Get all required features for an industry
 */
export const getRequiredFeatures = (industry: string): string[] => {
  const mapping = getIndustryFeatureMapping(industry);
  return mapping ? mapping.requiredFeatures : [];
};

/**
 * Get all optional features for an industry
 */
export const getOptionalFeatures = (industry: string): string[] => {
  const mapping = getIndustryFeatureMapping(industry);
  return mapping ? mapping.optionalFeatures : [];
};

/**
 * Get technical stack recommendations for an industry
 */
export const getTechnicalStack = (industry: string) => {
  const mapping = getIndustryFeatureMapping(industry);
  return mapping ? mapping.technicalStack : null;
};

/**
 * Get design guidelines for an industry
 */
export const getDesignGuidelines = (industry: string) => {
  const mapping = getIndustryFeatureMapping(industry);
  return mapping ? mapping.designGuidelines : null;
};
