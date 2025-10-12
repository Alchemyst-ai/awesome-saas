import { IndustryConfig } from '@/types/industry';
import { cacheManager, CACHE_KEYS, CACHE_TTL, cached } from './cache-manager';

/**
 * Industry configuration data for common sectors
 * Provides industry-specific context, features, and technical requirements
 */
export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  saas: {
    name: 'SaaS',
    displayName: 'Software as a Service',
    commonFeatures: [
      'User authentication and authorization',
      'Dashboard with analytics',
      'Subscription management',
      'API integration capabilities',
      'Real-time notifications',
      'User onboarding flow',
      'Settings and preferences',
      'Team collaboration features',
      'Data export functionality',
      'Help center and documentation',
    ],
    technicalRequirements: [
      'NextJS 14 with App Router',
      'TypeScript for type safety',
      'Tailwind CSS for styling',
      'Authentication system (NextAuth.js)',
      'Database integration (Prisma/Supabase)',
      'API routes for backend functionality',
      'State management (Zustand/Redux)',
      'Form handling and validation',
      'Payment processing integration',
      'Email service integration',
    ],
    designPatterns: [
      'Clean, professional interface',
      'Sidebar navigation with main content area',
      'Card-based layout for features',
      'Data visualization components',
      'Modal dialogs for actions',
      'Responsive grid layouts',
      'Loading states and skeletons',
      'Empty states with call-to-actions',
      'Progressive disclosure of information',
      'Consistent color scheme and typography',
    ],
    examplePrompts: [
      'Create a SaaS dashboard for project management with task tracking, team collaboration, and analytics',
      'Build a customer support SaaS platform with ticket management, knowledge base, and live chat',
      'Design a marketing automation SaaS tool with campaign management, email templates, and performance metrics',
    ],
    colorSchemes: ['blue-gray', 'indigo', 'slate'],
    layoutTypes: ['dashboard', 'sidebar-main', 'tabbed-interface'],
  },

  ecommerce: {
    name: 'E-commerce',
    displayName: 'E-commerce & Retail',
    commonFeatures: [
      'Product catalog with search and filters',
      'Shopping cart and checkout process',
      'User accounts and order history',
      'Payment processing integration',
      'Product reviews and ratings',
      'Wishlist functionality',
      'Inventory management',
      'Order tracking and notifications',
      'Promotional banners and discounts',
      'Customer support chat',
    ],
    technicalRequirements: [
      'NextJS 14 with App Router',
      'TypeScript for type safety',
      'Tailwind CSS for responsive design',
      'Payment gateway integration (Stripe)',
      'Product database with search capabilities',
      'Image optimization and CDN',
      'Shopping cart state management',
      'Form validation for checkout',
      'Email notifications system',
      'SEO optimization for products',
    ],
    designPatterns: [
      'Hero section with featured products',
      'Grid-based product listings',
      'Product detail pages with image galleries',
      'Sticky shopping cart summary',
      'Breadcrumb navigation',
      'Filter sidebar with categories',
      'Mobile-first responsive design',
      'Trust signals and security badges',
      'Clear call-to-action buttons',
      'Social proof elements',
    ],
    examplePrompts: [
      'Create an e-commerce store for fashion with product filtering, size guides, and wishlist functionality',
      'Build an electronics marketplace with product comparisons, reviews, and technical specifications',
      'Design a bookstore website with author pages, reading recommendations, and digital downloads',
    ],
    colorSchemes: ['emerald', 'orange', 'red'],
    layoutTypes: ['grid-catalog', 'hero-featured', 'category-focused'],
  },

  portfolio: {
    name: 'Portfolio',
    displayName: 'Portfolio & Personal',
    commonFeatures: [
      'About section with personal story',
      'Project showcase with case studies',
      'Skills and expertise display',
      'Contact form and information',
      'Resume/CV download',
      'Blog or articles section',
      'Testimonials and recommendations',
      'Social media integration',
      'Photo gallery or media showcase',
      'Professional timeline',
    ],
    technicalRequirements: [
      'NextJS 14 with static generation',
      'TypeScript for maintainability',
      'Tailwind CSS for custom styling',
      'Image optimization for portfolio pieces',
      'Contact form with email integration',
      'SEO optimization for personal branding',
      'Smooth animations and transitions',
      'Responsive design for all devices',
      'Fast loading performance',
      'Analytics integration',
    ],
    designPatterns: [
      'Hero section with personal introduction',
      'Masonry or grid layout for projects',
      'Full-screen project detail views',
      'Smooth scrolling and animations',
      'Minimalist and clean design',
      'Typography-focused layouts',
      'Image-heavy visual storytelling',
      'Fixed navigation with smooth scrolling',
      'Call-to-action for contact',
      'Professional color palette',
    ],
    examplePrompts: [
      'Create a designer portfolio showcasing UI/UX projects with case studies and process documentation',
      'Build a photographer portfolio with full-screen galleries, client testimonials, and booking system',
      'Design a developer portfolio highlighting coding projects, technical skills, and career timeline',
    ],
    colorSchemes: ['neutral', 'stone', 'zinc'],
    layoutTypes: ['hero-centered', 'masonry-grid', 'single-page'],
  },

  corporate: {
    name: 'Corporate',
    displayName: 'Corporate & Business',
    commonFeatures: [
      'Company overview and mission',
      'Services or products showcase',
      'Team member profiles',
      'Client testimonials and case studies',
      'News and press releases',
      'Contact information and locations',
      'Career opportunities page',
      'Investor relations section',
      'Corporate social responsibility',
      'Partnership and vendor information',
    ],
    technicalRequirements: [
      'NextJS 14 with App Router',
      'TypeScript for enterprise reliability',
      'Tailwind CSS for consistent branding',
      'CMS integration for content management',
      'SEO optimization for business visibility',
      'Multi-language support if needed',
      'Contact forms with CRM integration',
      'Analytics and tracking setup',
      'Security best practices',
      'Performance optimization',
    ],
    designPatterns: [
      'Professional header with company branding',
      'Hero section with value proposition',
      'Service cards with clear descriptions',
      'Team grid with professional photos',
      'Testimonial carousels or grids',
      'Footer with comprehensive links',
      'Trust indicators and certifications',
      'Clean, corporate color scheme',
      'Structured information hierarchy',
      'Mobile-responsive business layout',
    ],
    examplePrompts: [
      'Create a consulting firm website with service offerings, team expertise, and client success stories',
      'Build a technology company site showcasing products, solutions, and industry partnerships',
      'Design a law firm website with practice areas, attorney profiles, and client resources',
    ],
    colorSchemes: ['blue', 'gray', 'slate'],
    layoutTypes: ['corporate-standard', 'service-focused', 'team-centric'],
  },

  startup: {
    name: 'Startup',
    displayName: 'Startup & Innovation',
    commonFeatures: [
      'Product or service introduction',
      'Problem and solution explanation',
      'Founder and team stories',
      'Early access or beta signup',
      'Investor pitch and funding info',
      'Product roadmap and vision',
      'Community and user feedback',
      'Press coverage and media kit',
      'Partnership opportunities',
      'Job openings and culture',
    ],
    technicalRequirements: [
      'NextJS 14 for fast development',
      'TypeScript for scalable codebase',
      'Tailwind CSS for rapid styling',
      'Email capture and newsletter signup',
      'Analytics for growth tracking',
      'A/B testing capabilities',
      'Social media integration',
      'Fast loading and performance',
      'Mobile-first responsive design',
      'SEO for organic discovery',
    ],
    designPatterns: [
      'Bold, attention-grabbing hero section',
      'Problem-solution narrative flow',
      'Product demo or video showcase',
      'Founder story with personal touch',
      'Early adopter signup forms',
      'Social proof and traction metrics',
      'Modern, trendy design elements',
      'Vibrant color schemes',
      'Interactive elements and animations',
      'Community-focused sections',
    ],
    examplePrompts: [
      'Create a fintech startup landing page with product demo, founder story, and investor information',
      'Build a health tech startup site showcasing the solution, team expertise, and early access signup',
      'Design an AI startup website with technology explanation, use cases, and partnership opportunities',
    ],
    colorSchemes: ['purple', 'pink', 'cyan'],
    layoutTypes: ['landing-focused', 'story-driven', 'demo-centric'],
  },

  agency: {
    name: 'Agency',
    displayName: 'Creative Agency',
    commonFeatures: [
      'Portfolio of client work',
      'Service offerings and expertise',
      'Creative team profiles',
      'Client testimonials and reviews',
      'Case studies with results',
      'Creative process explanation',
      'Contact and project inquiry form',
      'Awards and recognition',
      'Blog with industry insights',
      'Partnership and collaboration info',
    ],
    technicalRequirements: [
      'NextJS 14 for creative flexibility',
      'TypeScript for project maintainability',
      'Tailwind CSS for custom designs',
      'Image and video optimization',
      'Portfolio gallery functionality',
      'Contact form with project details',
      'SEO for creative industry keywords',
      'Smooth animations and transitions',
      'Creative loading and interactions',
      'Performance optimization for media',
    ],
    designPatterns: [
      'Creative and visually striking design',
      'Portfolio grid with hover effects',
      'Full-screen project showcases',
      'Team photos with creative layouts',
      'Bold typography and color usage',
      'Interactive elements and animations',
      'Case study storytelling format',
      'Creative navigation patterns',
      'Artistic use of whitespace',
      'Unique brand personality expression',
    ],
    examplePrompts: [
      'Create a digital marketing agency website with campaign showcases, team creativity, and client results',
      'Build a design agency portfolio with creative projects, process explanation, and client testimonials',
      'Design a branding agency site showcasing brand identities, creative team, and strategic approach',
    ],
    colorSchemes: ['rose', 'amber', 'teal'],
    layoutTypes: ['portfolio-heavy', 'creative-showcase', 'process-focused'],
  },
};

/**
 * Get industry configuration with caching
 */
export const getIndustryConfig = (industry: string): IndustryConfig | null => {
  const cacheKey = CACHE_KEYS.INDUSTRY_CONFIG(industry);

  // Try cache first
  const cached = cacheManager.get<IndustryConfig>(cacheKey);
  if (cached) {
    return cached;
  }

  // Get from static data
  const config = INDUSTRY_CONFIGS[industry] || null;

  // Cache the result
  if (config) {
    cacheManager.set(cacheKey, config, CACHE_TTL.INDUSTRY_DATA);
  }

  return config;
};

/**
 * Get list of all available industries with caching
 */
export const getAvailableIndustries = (): string[] => {
  const cacheKey = 'available_industries';

  // Try cache first
  const cached = cacheManager.get<string[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Generate list
  const industries = Object.keys(INDUSTRY_CONFIGS);

  // Cache the result
  cacheManager.set(cacheKey, industries, CACHE_TTL.INDUSTRY_DATA);

  return industries;
};

/**
 * Get display names for all industries with caching
 */
export const getIndustryDisplayNames = (): Record<string, string> => {
  const cacheKey = 'industry_display_names';

  // Try cache first
  const cached = cacheManager.get<Record<string, string>>(cacheKey);
  if (cached) {
    return cached;
  }

  // Generate display names
  const displayNames = Object.fromEntries(
    Object.entries(INDUSTRY_CONFIGS).map(([key, config]) => [
      key,
      config.displayName,
    ])
  );

  // Cache the result
  cacheManager.set(cacheKey, displayNames, CACHE_TTL.INDUSTRY_DATA);

  return displayNames;
};

/**
 * Preload industry data into cache
 */
export const preloadIndustryData = (): void => {
  // Preload all industry configs
  Object.keys(INDUSTRY_CONFIGS).forEach((industry) => {
    getIndustryConfig(industry);
  });

  // Preload derived data
  getAvailableIndustries();
  getIndustryDisplayNames();
};
