import {
  ExamplePrompt,
  ExamplePromptTemplate,
  InteractiveExample,
} from '@/types/examples';

/**
 * Sample prompts for different industries showcasing effective V0 prompt creation
 */
export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: 'saas-dashboard',
    title: 'SaaS Analytics Dashboard',
    industry: 'saas',
    description:
      'A comprehensive dashboard for a project management SaaS with analytics, team features, and modern UI',
    fullPrompt: `Create a modern SaaS dashboard for "TaskFlow Pro" - a project management platform that helps teams collaborate and track progress.

**Context & Purpose:**
- Industry: Software as a Service (SaaS)
- Target Users: Project managers, team leads, and development teams
- Primary Goal: Provide comprehensive project oversight with real-time collaboration

**Core Features Required:**
- Dashboard with project analytics and KPI charts
- Task management with drag-and-drop kanban boards
- Team collaboration with real-time updates and comments
- User authentication with role-based permissions
- Notification system for deadlines and updates
- Time tracking and reporting capabilities
- File sharing and document management

**Technical Specifications:**
- Framework: NextJS 14 with App Router and TypeScript
- Styling: Tailwind CSS with a professional blue-gray color scheme
- Components: Recharts for analytics, React DnD for kanban boards
- Authentication: NextAuth.js with role-based access control
- Database: Integration ready for Prisma/Supabase
- State Management: Zustand for global state

**Design Requirements:**
- Clean, professional interface with sidebar navigation
- Responsive design optimized for desktop and tablet use
- Card-based layout for project and task organization
- Data visualization with interactive charts and graphs
- Loading states and skeleton screens for better UX
- Modal dialogs for task creation and editing

**User Experience:**
- Intuitive navigation with breadcrumbs and search
- Quick actions accessible from any page
- Keyboard shortcuts for power users
- Progressive disclosure to avoid information overload
- Empty states with helpful onboarding guidance`,
    tags: ['dashboard', 'analytics', 'collaboration', 'kanban', 'charts'],
    difficulty: 'intermediate',
    features: [
      'Authentication',
      'Real-time Updates',
      'Data Visualization',
      'Drag & Drop',
      'File Upload',
    ],
    explanation: {
      why: 'This prompt works well because it provides comprehensive context about the business purpose, clearly defines the target users, and specifies both functional and technical requirements in detail.',
      keyElements: [
        'Clear business context and target audience',
        'Specific feature list with technical details',
        'Design requirements with visual guidance',
        'Technical stack recommendations',
        'UX considerations for better usability',
      ],
      tips: [
        'Always start with business context to help V0 understand the purpose',
        'Be specific about technical requirements to get better code structure',
        'Include UX details like loading states and empty states',
        'Mention responsive design requirements explicitly',
      ],
    },
  },
  {
    id: 'ecommerce-store',
    title: 'Fashion E-commerce Store',
    industry: 'ecommerce',
    description:
      'A modern fashion e-commerce website with product filtering, wishlist, and seamless checkout',
    fullPrompt: `Build a modern e-commerce website for "StyleHub" - a contemporary fashion retailer targeting young professionals.

**Business Context:**
- Industry: Fashion E-commerce
- Target Audience: Young professionals aged 25-35 seeking trendy, quality clothing
- Brand Personality: Modern, accessible luxury with sustainable focus

**Essential E-commerce Features:**
- Product catalog with advanced filtering (size, color, price, brand, style)
- High-quality product image galleries with zoom functionality
- Size guide and fit recommendations
- Shopping cart with saved items and quick checkout
- User accounts with order history and tracking
- Wishlist and favorites functionality
- Product reviews and ratings system
- Search with autocomplete and suggestions

**Technical Implementation:**
- Framework: NextJS 14 with App Router for SEO optimization
- Styling: Tailwind CSS with an elegant emerald and neutral color palette
- Payment: Stripe integration for secure checkout
- Images: Next.js Image optimization with lazy loading
- Search: Algolia or similar for fast product discovery
- State: Zustand for cart and user preferences

**Design & UX Requirements:**
- Mobile-first responsive design with touch-friendly interactions
- Hero section showcasing seasonal collections
- Grid-based product listings with hover effects
- Sticky cart summary during checkout process
- Trust signals: security badges, return policy, customer reviews
- Social proof: customer photos, testimonials, social media integration

**Conversion Optimization:**
- Clear call-to-action buttons with contrasting colors
- Abandoned cart recovery prompts
- Related product recommendations
- Limited-time offers and promotional banners
- Guest checkout option for faster conversion
- Multiple payment methods and shipping options`,
    tags: ['ecommerce', 'fashion', 'filtering', 'checkout', 'mobile-first'],
    difficulty: 'advanced',
    features: [
      'Product Catalog',
      'Payment Integration',
      'User Accounts',
      'Search & Filter',
      'Reviews',
    ],
    explanation: {
      why: 'This prompt excels by combining business strategy with technical requirements, focusing on conversion optimization and user experience specific to fashion e-commerce.',
      keyElements: [
        'Clear target audience and brand personality',
        'Comprehensive e-commerce feature set',
        'Conversion optimization strategies',
        'Mobile-first design approach',
        'Technical stack suited for e-commerce',
      ],
      tips: [
        'Include business context to inform design decisions',
        'Specify conversion optimization features',
        'Mention mobile-first for better responsive design',
        'Include trust signals and social proof elements',
      ],
    },
  },
  {
    id: 'portfolio-designer',
    title: 'Creative Designer Portfolio',
    industry: 'portfolio',
    description:
      'A visually striking portfolio for a UI/UX designer showcasing projects and creative process',
    fullPrompt: `Create a stunning portfolio website for "Alex Chen" - a senior UI/UX designer specializing in digital product design and user research.

**Professional Context:**
- Role: Senior UI/UX Designer with 6+ years experience
- Specialization: SaaS products, mobile apps, and design systems
- Target Audience: Potential employers, clients, and design community
- Career Goal: Attract senior design roles at innovative tech companies

**Portfolio Content Structure:**
- Hero section with professional photo and compelling headline
- Featured case studies (3-4 projects) with detailed process documentation
- Skills showcase including design tools, methodologies, and soft skills
- About section with personal story and design philosophy
- Contact information with multiple ways to connect
- Downloadable resume/CV in PDF format
- Optional blog section for design insights and thoughts

**Case Study Requirements:**
- Project overview with problem statement and goals
- Design process documentation (research, ideation, prototyping, testing)
- High-quality mockups and prototypes
- Results and impact metrics where available
- Lessons learned and next steps
- Interactive prototypes or live demos when possible

**Technical Specifications:**
- Framework: NextJS 14 with static generation for fast loading
- Styling: Tailwind CSS with a sophisticated neutral color palette
- Animations: Framer Motion for smooth transitions and micro-interactions
- Images: Optimized loading with progressive enhancement
- Typography: Modern font pairing emphasizing readability
- Performance: Lighthouse score of 90+ for professional credibility

**Design Philosophy:**
- Minimalist aesthetic that lets the work speak for itself
- Generous whitespace and thoughtful typography hierarchy
- Smooth scrolling and subtle animations
- Accessibility-first approach with proper contrast and navigation
- Mobile-responsive design that works beautifully on all devices`,
    tags: ['portfolio', 'designer', 'case-studies', 'minimalist', 'animations'],
    difficulty: 'beginner',
    features: [
      'Case Studies',
      'Image Galleries',
      'Smooth Animations',
      'PDF Download',
      'Contact Form',
    ],
    explanation: {
      why: "This prompt works because it establishes the designer's professional context, specifies the portfolio structure, and emphasizes the importance of showcasing design process.",
      keyElements: [
        'Professional context and career goals',
        'Detailed case study structure',
        'Design philosophy and aesthetic direction',
        'Performance and accessibility considerations',
        'Technical requirements for portfolio sites',
      ],
      tips: [
        'Establish professional context for better content suggestions',
        'Specify case study structure for comprehensive project presentation',
        'Include performance requirements for professional credibility',
        'Mention accessibility to ensure inclusive design',
      ],
    },
  },
];

/**
 * Reusable prompt templates for different industries
 */
export const PROMPT_TEMPLATES: ExamplePromptTemplate[] = [
  {
    id: 'saas-template',
    name: 'SaaS Application Template',
    industry: 'saas',
    description:
      'A comprehensive template for SaaS applications with dashboard, authentication, and subscription features',
    template: `Create a modern SaaS application for "{websiteName}" - {aboutInfo}

**Business Context:**
- Industry: Software as a Service (SaaS)
- Target Users: {targetUsers}
- Primary Value Proposition: {valueProposition}

**Core SaaS Features:**
- User authentication and onboarding flow
- Dashboard with key metrics and analytics
- {specificFeatures}
- Subscription management and billing
- User settings and preferences
- Help center and documentation

**Technical Stack:**
- Framework: NextJS 14 with App Router and TypeScript
- Styling: Tailwind CSS with {colorScheme} color scheme
- Authentication: NextAuth.js with role-based permissions
- Database: Prisma with PostgreSQL or Supabase
- Payments: Stripe for subscription management
- State Management: Zustand for global state

**Design Requirements:**
- Professional, clean interface with sidebar navigation
- Responsive design optimized for desktop and tablet
- Card-based layout for features and data
- Loading states and skeleton screens
- Modal dialogs for actions and forms

**User Experience:**
- Intuitive onboarding with progressive disclosure
- Quick actions and keyboard shortcuts
- Search functionality across the application
- Real-time notifications and updates
- Empty states with helpful guidance`,
    placeholders: {
      websiteName: 'Your SaaS application name',
      aboutInfo: 'Brief description of what your SaaS does',
      targetUsers:
        'Who will use this application (e.g., project managers, developers)',
      valueProposition: 'Main benefit your SaaS provides',
      specificFeatures: 'List 3-5 specific features your SaaS needs',
      colorScheme: 'Color preference (e.g., blue-gray, indigo, slate)',
    },
    instructions: [
      'Replace {websiteName} with your actual application name',
      'Describe your SaaS functionality in {aboutInfo}',
      'Specify your target users clearly',
      'List specific features your application needs',
      'Choose a professional color scheme',
    ],
    examples: [
      {
        websiteName: 'ProjectFlow',
        aboutInfo:
          'a project management tool that helps teams track tasks and collaborate effectively',
        result:
          'A comprehensive SaaS dashboard with kanban boards, team collaboration, and project analytics',
      },
      {
        websiteName: 'DataInsight',
        aboutInfo:
          'an analytics platform that transforms business data into actionable insights',
        result:
          'A data visualization SaaS with interactive charts, custom dashboards, and reporting tools',
      },
    ],
  },
];

/**
 * Interactive examples that users can modify and experiment with
 */
export const INTERACTIVE_EXAMPLES: InteractiveExample[] = [
  {
    id: 'saas-evolution',
    title: 'SaaS Prompt Evolution',
    description:
      'See how adding specific details transforms a basic SaaS prompt into a comprehensive specification',
    initialInput: {
      websiteName: 'TaskManager',
      industry: 'saas',
      aboutInfo: 'A simple task management app',
    },
    expectedOutput:
      'Basic SaaS application with minimal features and generic design',
    modifications: [
      {
        name: 'Add Target Audience',
        description: 'Specify who will use the application',
        changes: {
          aboutInfo:
            'A task management app for remote development teams to track sprints and collaborate on projects',
        },
        expectedResult:
          'More focused design with developer-specific features like sprint planning and code integration',
      },
      {
        name: 'Include Specific Features',
        description: 'Add detailed feature requirements',
        changes: {
          aboutInfo:
            'A task management app for remote development teams with sprint planning, time tracking, GitHub integration, and team performance analytics',
        },
        expectedResult:
          'Comprehensive SaaS with specific integrations, analytics dashboard, and developer workflow features',
      },
    ],
  },
];
