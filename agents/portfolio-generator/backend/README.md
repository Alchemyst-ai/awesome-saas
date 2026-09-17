# Portfolio Generator Backend

Backend service for generating professional portfolios using the official AlchemystAI SDK for data extraction and Google Gemini for content generation.

## Overview

This backend service integrates with the official **@alchemystai/sdk** package to extract and enrich data from LinkedIn profiles and GitHub accounts, and uses Google Gemini to generate comprehensive portfolio content.

## Features

- **AlchemystAI SDK Integration**: Official SDK for context enrichment and data extraction
- **Data Extraction**: Fetches data from LinkedIn profiles and GitHub accounts
- **Context Enrichment**: Processes and enriches raw data with additional context
- **AI-Powered Generation**: Uses Google Gemini to generate structured portfolio content
- **RESTful API**: Express.js-based API with CORS support
- **TypeScript**: Fully typed codebase for better developer experience
- **Environment Variables**: Secure API key management using .env files

## Architecture

```
src/
├── clients/              # External API clients
│   ├── alchemstClient.ts # AlchemystAI SDK integration
│   └── geminiClient.ts   # Google Gemini API integration
├── services/             # Business logic layer
│   ├── portfolioGenerator.ts  # Main portfolio generation orchestrator
│   └── contextEnricher.ts     # Data enrichment service
├── controllers/          # Request handlers
│   └── portfolioController.ts # Portfolio generation endpoint
└── app.ts               # Express app configuration and server setup
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AlchemystAI API key
- Google Gemini API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- `@alchemystai/sdk` - Official AlchemystAI SDK
- `express` - Web framework
- `dotenv` - Environment variable management
- Other development dependencies

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your API keys to the `.env` file:

```env
# AlchemystAI SDK Configuration
ALCHEMYST_API_KEY=your_alchemystai_api_key_here

# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
```

### 3. AlchemystAI SDK Setup

The AlchemystAI SDK is configured in `src/clients/alchemstClient.ts`:

```typescript
import AlchemystAI from '@alchemystai/sdk';

// Initialize the client with your API key
const client = new AlchemystAI({
  apiKey: process.env.ALCHEMYST_API_KEY || ''
});

// Use SDK methods for context enrichment
await client.v1.context.add({
  source: 'linkedin',
  url: linkedinUrl,
  type: 'profile'
});
```

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Usage

### Generate Portfolio

**Endpoint:** `POST /api/generate-portfolio`

**Request Body:**
```json
{
  "linkedinUrl": "https://linkedin.com/in/username",
  "githubUsername": "username"
}
```

**Response:**
```json
{
  "portfolio": "Generated portfolio content...",
  "metadata": {
    "linkedin": { /* enriched data */ },
    "github": { /* enriched data */ }
  }
}
```

## AlchemystAI SDK Documentation

For detailed information about the @alchemystai/sdk package and its methods:

- [Official SDK Documentation](https://www.npmjs.com/package/@alchemystai/sdk)
- [API Reference](https://github.com/Alchemyst-ai/alchemyst-sdk/blob/HEAD/api.md)

Available SDK methods:
- `client.v1.context.add()` - Add context for enrichment
- `client.v1.context.search()` - Search through context
- `client.v1.context.delete()` - Remove context
- And more...

## Project Structure Details

### Clients
- **alchemstClient.ts**: Manages AlchemystAI SDK integration
  - Initializes SDK client with API key
  - Handles LinkedIn and GitHub data enrichment
  - Error handling and logging
  
- **geminiClient.ts**: Google Gemini API integration
  - Content generation based on enriched data
  - Prompt engineering for portfolio generation

### Services
- **portfolioGenerator.ts**: Orchestrates the portfolio generation flow
- **contextEnricher.ts**: Enriches raw data with additional context

### Controllers
- **portfolioController.ts**: Handles portfolio generation requests

## Error Handling

The API includes comprehensive error handling:
- Missing API keys throw configuration errors
- Failed API calls are caught and logged
- Client errors return appropriate HTTP status codes
- All errors include descriptive messages

## Security Notes

⚠️ **Important**: Never commit your `.env` file or API keys to version control.

- Store API keys securely in environment variables
- Use `.env` file for local development only
- In production, use secure secret management services
- The `.env` file is included in `.gitignore` by default

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on GitHub.
