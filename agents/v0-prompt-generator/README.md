# V0 Prompt Generator

An AI-powered tool that transforms minimal website information into comprehensive, optimized prompts for Vercel V0. Generate high-quality website prompts by simply providing your website name, industry, and basic description.

## Features

- **AI-Powered Generation**: Uses Alchemyst AI SDK to create detailed V0 prompts
- **Industry-Specific Templates**: Tailored prompts for different business sectors
- **Real-time Editing**: Modify generated prompts before using them
- **Copy-to-Clipboard**: Easy integration with V0 workflow
- **Example Gallery**: Learn from sample prompts across industries
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Quick Start

### Prerequisites

- Node.js 18+ and npm
<<<<<<< HEAD
- Alchemyst AI API key ([Get one here]((https://platform.getalchemystai.com/getstarted)))
=======
- Alchemyst AI API key ([Get one here](https://platform.getalchemystai.com/getstarted))
>>>>>>> 0128e5a (fix(docs): update Alchemyst AI Dashboard links and API base URL in README.md and DEPLOYMENT.)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd v0-prompt-generator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Alchemyst AI API key:

   ```env
   ALCHEMYST_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Workflow

1. **Enter Website Information**
   - Website name (e.g., "TechFlow Solutions")
   - Industry (e.g., "SaaS", "E-commerce", "Portfolio")
   - About description (brief overview of your website's purpose)

2. **Generate Prompt**
   - Click "Generate Prompt" to create an AI-optimized V0 prompt
   - The system enriches your input with industry-specific context

3. **Review and Edit**
   - Review the generated prompt sections
   - Make real-time edits if needed
   - Understand why certain elements were included

4. **Copy and Use**
   - Copy the final prompt to clipboard
   - Paste directly into Vercel V0 for website generation

### Example Usage

**Input:**

- Website Name: "GreenLeaf Consulting"
- Industry: "Professional Services"
- About: "Environmental consulting firm helping businesses reduce their carbon footprint"

**Generated Output:**
A comprehensive V0 prompt including:

- Professional service industry context
- Environmental consulting specific features
- Technical recommendations (Next.js, contact forms, case studies)
- Design guidelines (professional, trustworthy, eco-friendly colors)

## Project Structure

```
v0-prompt-generator/
├── src/
│   ├── app/                    # Next.js app router
│   ├── components/             # React components
│   │   ├── InputForm.tsx       # User input collection
│   │   ├── GenerationEngine.tsx # AI processing
│   │   ├── OutputDisplay.tsx   # Prompt display and editing
│   │   ├── ExampleGallery.tsx  # Sample prompts
│   │   └── PromptGenerator.tsx # Main container
│   ├── lib/                    # Core business logic
│   │   ├── ai-client.ts        # Alchemyst AI integration
│   │   ├── industry-config.ts  # Industry knowledge base
│   │   ├── prompt-templates.ts # Prompt structuring
│   │   └── validation.ts       # Input validation
│   ├── types/                  # TypeScript definitions
│   ├── utils/                  # Helper functions
│   └── __tests__/              # Test files
├── public/                     # Static assets
├── vercel.json                 # Vercel deployment config
└── DEPLOYMENT.md               # Deployment guide
```

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Testing

- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only

### Analysis

- `npm run analyze` - Analyze bundle size
- `npm run performance:monitor` - Run performance monitoring

## Configuration

### Environment Variables

| Variable                                    | Description                 | Required | Default                        |
| ------------------------------------------- | --------------------------- | -------- | ------------------------------ |
| `ALCHEMYST_API_KEY`                         | Your Alchemyst AI API key   | Yes      | -                              |
| `ALCHEMYST_BASE_URL`                        | Alchemyst AI API base URL   | No       | https://api.getalchemystai.com |
| `NEXT_PUBLIC_APP_NAME`                      | Application name            | No       | V0 Prompt Generator            |
| `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING` | Enable performance tracking | No       | false                          |

### Supported Industries

- **SaaS**: Software as a Service applications
- **E-commerce**: Online stores and marketplaces
- **Portfolio**: Personal and professional portfolios
- **Professional Services**: Consulting, legal, medical
- **Education**: Schools, courses, training platforms
- **Non-profit**: Charitable organizations and causes
- **Restaurant**: Food service and hospitality
- **Real Estate**: Property listings and agencies
- **Healthcare**: Medical practices and health services
- **Technology**: Tech companies and startups

## API Documentation

### Core Components

#### InputForm Component

```typescript
interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}
```

Handles user input collection with validation and helpful guidance.

#### GenerationEngine Component

```typescript
interface GenerationEngineProps {
  userInput: UserInput;
  onGenerated: (prompt: GeneratedPrompt) => void;
  onError: (error: string) => void;
}
```

Processes user input through Alchemyst AI and structures the output.

#### OutputDisplay Component

```typescript
interface OutputDisplayProps {
  prompt: GeneratedPrompt;
  onEdit: (editedPrompt: string) => void;
  onCopy: () => void;
}
```

Displays generated prompts with editing and copy functionality.

### Data Types

#### UserInput

```typescript
interface UserInput {
  websiteName: string;
  industry: string;
  aboutInfo: string;
  additionalRequirements?: string;
}
```

#### GeneratedPrompt

```typescript
interface GeneratedPrompt {
  title: string;
  description: string;
  context: string;
  technicalSpecs: string;
  industryFeatures: string[];
  fullPrompt: string;
  explanation: PromptExplanation;
}
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/v0-prompt-generator)

1. Click the deploy button above
2. Add your `ALCHEMYST_API_KEY` environment variable
3. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use Prettier for code formatting
- Follow the existing component structure
- Update documentation for API changes

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: AI workflow and user journey testing
- **E2E Tests**: Complete user flow validation
- **Performance Tests**: Bundle size and runtime performance

Run tests with:

```bash
npm run test:coverage
```

## Performance

- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Caching**: Industry templates and AI responses cached
- **Bundle Analysis**: Regular bundle size monitoring
- **Core Web Vitals**: Optimized for Google's performance metrics

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Ensure `ALCHEMYST_API_KEY` is set correctly
   - Check API key permissions in Alchemyst dashboard

2. **Build Errors**
   - Run `npm run lint` to check for code issues
   - Ensure all TypeScript types are properly defined

3. **Performance Issues**
   - Check network connectivity
   - Monitor API response times
   - Use performance monitoring tools

### Getting Help

- Check the [Issues](https://github.com/your-username/v0-prompt-generator/issues) page
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Contact support at [support@example.com](mailto:support@example.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Vercel](https://vercel.com) for the hosting platform
- [Alchemyst AI](https://getalchemystai.com) for the AI capabilities
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for styling
