import { PromptTemplate } from '@/types';
import { IndustryTemplate } from '@/types/industry';

/**
 * Base prompt template structure for V0 optimization
 */
export const BASE_PROMPT_TEMPLATE: PromptTemplate = {
  structure: {
    introduction: `Create a modern, responsive website for {{websiteName}} in the {{industry}} industry.`,
    context: `This is a {{industry}} website that {{aboutInfo}}. The target audience includes {{targetAudience}} who are looking for {{primaryValue}}.`,
    technicalSpecs: `Use NextJS 14 with App Router, TypeScript, and Tailwind CSS. {{additionalTech}}`,
    designRequirements: `Design should be {{designStyle}} with a {{colorScheme}} color scheme. Layout should be {{layoutType}} and fully responsive.`,
    functionalRequirements: `Include the following key features: {{coreFeatures}}. Ensure {{userExperience}} and {{performanceRequirements}}.`,
  },
  placeholders: {
    '{{websiteName}}': 'Website name from user input',
    '{{industry}}': 'Selected industry',
    '{{aboutInfo}}': 'User-provided description',
    '{{targetAudience}}': 'Inferred from industry context',
    '{{primaryValue}}': 'Main value proposition',
    '{{additionalTech}}': 'Industry-specific technical requirements',
    '{{designStyle}}': 'Industry-appropriate design style',
    '{{colorScheme}}': 'Recommended color scheme',
    '{{layoutType}}': 'Optimal layout pattern',
    '{{coreFeatures}}': 'Essential features list',
    '{{userExperience}}': 'UX considerations',
    '{{performanceRequirements}}': 'Performance specifications',
  },
  industrySpecific: {
    saas: [
      'dashboard functionality',
      'user authentication',
      'subscription management',
      'analytics integration',
    ],
    ecommerce: [
      'product catalog',
      'shopping cart',
      'payment processing',
      'order management',
    ],
    portfolio: [
      'project showcase',
      'contact form',
      'resume download',
      'social media links',
    ],
    corporate: [
      'company information',
      'service descriptions',
      'team profiles',
      'contact details',
    ],
    startup: [
      'product introduction',
      'founder story',
      'early access signup',
      'investor information',
    ],
    agency: [
      'portfolio gallery',
      'service offerings',
      'team showcase',
      'client testimonials',
    ],
  },
};

/**
 * Industry-specific prompt templates
 */
export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  saas: {
    industry: 'saas',
    templateType: 'advanced',
    sections: {
      hero: `Create a compelling hero section with the main value proposition of {{websiteName}}. Include a clear headline about {{primaryBenefit}}, a subheading explaining {{problemSolved}}, and a prominent CTA button for {{primaryAction}}.`,
      features: `Design a features section showcasing the key capabilities: {{keyFeatures}}. Use cards or icons to highlight {{mainFeatures}} with brief descriptions and benefits.`,
      about: `Include an about section that explains {{companyStory}} and builds trust with potential customers. Highlight the team's expertise in {{industryExpertise}}.`,
      contact: `Add a contact section with {{contactMethods}} and a demo request form. Include social proof elements like {{trustSignals}}.`,
      additional: [
        'pricing section with subscription tiers',
        'testimonials from satisfied customers',
        'integration showcase with popular tools',
        'security and compliance badges',
      ],
    },
    placeholders: {
      '{{primaryBenefit}}': 'Main benefit the SaaS provides',
      '{{problemSolved}}': 'Core problem the software solves',
      '{{primaryAction}}': 'Main call-to-action (trial, demo, signup)',
      '{{keyFeatures}}': 'List of core features',
      '{{mainFeatures}}': 'Top 3-4 most important features',
      '{{companyStory}}': 'Brief company background',
      '{{industryExpertise}}': 'Team expertise areas',
      '{{contactMethods}}': 'Available contact options',
      '{{trustSignals}}': 'Customer logos, testimonials, certifications',
    },
    customizations: {
      colors: ['blue', 'indigo', 'slate', 'gray'],
      fonts: ['Inter', 'Roboto', 'Open Sans'],
      layouts: ['dashboard-style', 'landing-focused', 'feature-heavy'],
    },
  },

  ecommerce: {
    industry: 'ecommerce',
    templateType: 'advanced',
    sections: {
      hero: `Create an engaging hero section for {{websiteName}} featuring {{heroContent}}. Include navigation with categories, search functionality, and shopping cart icon.`,
      features: `Design a product showcase section displaying {{productTypes}} with filtering options for {{filterCategories}}. Include product cards with images, prices, and quick add-to-cart buttons.`,
      about: `Add an about section highlighting {{brandStory}} and what makes {{websiteName}} unique in the {{productCategory}} market.`,
      contact: `Include customer service information with {{supportChannels}} and a contact form for inquiries. Add shipping and return policy links.`,
      additional: [
        'featured products carousel',
        'customer reviews and ratings',
        'newsletter signup with discount offer',
        'trust badges and security certifications',
      ],
    },
    placeholders: {
      '{{heroContent}}': 'Featured products or promotional banner',
      '{{productTypes}}': 'Types of products sold',
      '{{filterCategories}}': 'Product filtering options',
      '{{brandStory}}': 'Brand history and values',
      '{{productCategory}}': 'Main product category',
      '{{supportChannels}}': 'Customer support options',
    },
    customizations: {
      colors: ['emerald', 'orange', 'red', 'blue'],
      fonts: ['Poppins', 'Nunito', 'Lato'],
      layouts: ['grid-heavy', 'category-focused', 'brand-centric'],
    },
  },

  portfolio: {
    industry: 'portfolio',
    templateType: 'basic',
    sections: {
      hero: `Create a personal hero section introducing {{fullName}} as a {{profession}}. Include a professional photo, brief tagline about {{expertise}}, and navigation to key sections.`,
      features: `Design a portfolio section showcasing {{projectTypes}} with thumbnail images and brief descriptions. Each project should link to detailed case studies.`,
      about: `Add a comprehensive about section covering {{background}}, {{skills}}, and {{experience}}. Include a downloadable resume/CV.`,
      contact: `Include contact information with {{contactPreferences}} and a contact form. Add links to {{socialProfiles}} and professional networks.`,
      additional: [
        'skills and expertise section',
        'testimonials from clients or colleagues',
        'blog or articles section',
        'career timeline or experience',
      ],
    },
    placeholders: {
      '{{fullName}}': 'Professional name',
      '{{profession}}': 'Job title or profession',
      '{{expertise}}': 'Areas of specialization',
      '{{projectTypes}}': 'Types of work showcased',
      '{{background}}': 'Professional background',
      '{{skills}}': 'Technical and soft skills',
      '{{experience}}': 'Work experience highlights',
      '{{contactPreferences}}': 'Preferred contact methods',
      '{{socialProfiles}}': 'Social media and professional profiles',
    },
    customizations: {
      colors: ['neutral', 'stone', 'zinc', 'slate'],
      fonts: ['Playfair Display', 'Merriweather', 'Source Sans Pro'],
      layouts: ['minimal', 'creative', 'professional'],
    },
  },

  corporate: {
    industry: 'corporate',
    templateType: 'enterprise',
    sections: {
      hero: `Create a professional hero section for {{companyName}} highlighting {{mainService}} and {{valueProposition}}. Include clear navigation and contact information.`,
      features: `Design a services section detailing {{serviceOfferings}} with professional descriptions and benefits for {{targetClients}}.`,
      about: `Add a comprehensive company section covering {{companyHistory}}, {{mission}}, and {{teamExpertise}}. Include leadership team profiles.`,
      contact: `Include multiple contact options with {{officeLocations}}, phone numbers, and a professional inquiry form. Add business hours and response expectations.`,
      additional: [
        'client testimonials and case studies',
        'industry certifications and awards',
        'news and press releases section',
        'career opportunities page',
      ],
    },
    placeholders: {
      '{{companyName}}': 'Official company name',
      '{{mainService}}': 'Primary service or product',
      '{{valueProposition}}': 'Unique value proposition',
      '{{serviceOfferings}}': 'List of services provided',
      '{{targetClients}}': 'Target client types',
      '{{companyHistory}}': 'Company background and history',
      '{{mission}}': 'Company mission and values',
      '{{teamExpertise}}': 'Team qualifications and expertise',
      '{{officeLocations}}': 'Physical office locations',
    },
    customizations: {
      colors: ['blue', 'gray', 'slate', 'stone'],
      fonts: ['Inter', 'Roboto', 'Open Sans'],
      layouts: ['traditional', 'modern-corporate', 'service-focused'],
    },
  },

  startup: {
    industry: 'startup',
    templateType: 'advanced',
    sections: {
      hero: `Create an exciting hero section for {{startupName}} introducing {{innovation}} and how it {{solvesProblems}}. Include a compelling headline and early access signup.`,
      features: `Design a product section explaining {{productFeatures}} and {{uniqueAdvantages}}. Use modern visuals and clear benefit statements.`,
      about: `Add a founder story section covering {{founderBackground}}, {{inspiration}}, and {{vision}} for the future. Include team photos and expertise.`,
      contact: `Include investor relations contact, media inquiries, and partnership opportunities. Add social media links and community channels.`,
      additional: [
        'product roadmap and future plans',
        'early user testimonials or beta feedback',
        'press coverage and media mentions',
        'job openings and company culture',
      ],
    },
    placeholders: {
      '{{startupName}}': 'Startup company name',
      '{{innovation}}': 'Innovative product or service',
      '{{solvesProblems}}': 'Problems the startup solves',
      '{{productFeatures}}': 'Key product features',
      '{{uniqueAdvantages}}': 'Competitive advantages',
      '{{founderBackground}}': 'Founder experience and background',
      '{{inspiration}}': 'What inspired the startup',
      '{{vision}}': 'Long-term vision and goals',
    },
    customizations: {
      colors: ['purple', 'pink', 'cyan', 'indigo'],
      fonts: ['Inter', 'Poppins', 'Nunito'],
      layouts: ['story-driven', 'product-focused', 'founder-centric'],
    },
  },

  agency: {
    industry: 'agency',
    templateType: 'advanced',
    sections: {
      hero: `Create a creative hero section for {{agencyName}} showcasing {{creativeExpertise}} and {{uniqueApproach}}. Include an eye-catching design and portfolio preview.`,
      features: `Design a services section highlighting {{serviceTypes}} with creative examples and {{clientResults}}. Use visual elements to demonstrate capabilities.`,
      about: `Add a team section featuring {{teamMembers}} with their creative backgrounds and {{collectiveExperience}}. Show the agency's personality and culture.`,
      contact: `Include project inquiry form with {{projectTypes}} options and {{contactPreferences}}. Add office location and creative workspace photos.`,
      additional: [
        'portfolio gallery with case studies',
        'client testimonials and success stories',
        'awards and industry recognition',
        'creative process explanation',
      ],
    },
    placeholders: {
      '{{agencyName}}': 'Creative agency name',
      '{{creativeExpertise}}': 'Areas of creative expertise',
      '{{uniqueApproach}}': 'What makes the agency unique',
      '{{serviceTypes}}': 'Types of creative services',
      '{{clientResults}}': 'Results achieved for clients',
      '{{teamMembers}}': 'Key team members and roles',
      '{{collectiveExperience}}': 'Combined team experience',
      '{{projectTypes}}': 'Types of projects handled',
      '{{contactPreferences}}': 'Preferred project inquiry methods',
    },
    customizations: {
      colors: ['rose', 'amber', 'teal', 'purple'],
      fonts: ['Montserrat', 'Playfair Display', 'Poppins'],
      layouts: ['portfolio-heavy', 'creative-showcase', 'team-focused'],
    },
  },
};

/**
 * Get template for specific industry
 */
export const getIndustryTemplate = (
  industry: string
): IndustryTemplate | null => {
  return INDUSTRY_TEMPLATES[industry] || null;
};

/**
 * Get all available template types
 */
export const getTemplateTypes = (): string[] => {
  return Array.from(
    new Set(Object.values(INDUSTRY_TEMPLATES).map((t) => t.templateType))
  );
};
