# AI Prompt Evaluator

This project is an AI-powered prompt evaluation tool built with [Next.js](https://nextjs.org). It analyzes user prompts and provides structured feedback to help improve clarity, groundedness, tonality, and overall effectiveness. The evaluation is performed using Google's Gemini LLM and context management via AlchemystAI.

## Features

- Enter a prompt and receive an instant evaluation.
- Visualize prompt quality across multiple criteria (relevance, intent match, groundedness, fluency, conciseness, reference alignment, tonality).
- Get actionable suggestions and an improved version of your prompt.
- Interactive charts and UI components for clear feedback.

## How It Works

1. Enter your prompt in the input box.
2. Click **Evaluate**.
3. The backend sends your prompt to a Gemini LLM, using context from previous evaluations via AlchemystAI.
4. The LLM returns a JSON evaluation, which is visualized and displayed in the UI.

## Running Locally

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, pnpm, or bun

### Environment Variables

Create a `.env.local` file in the root directory and add:

```
GOOGLE_API_KEY=your-google-generative-ai-key
ALCHEMYST_API_KEY=your-alchemystai-sdk-key
```

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Dependencies

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- [@alchemystai/sdk](https://www.npmjs.com/package/@alchemystai/sdk)
- [@tanstack/react-query](https://tanstack.com/query/latest)
- [d3](https://d3js.org) (for charts)
- [Tailwind CSS](https://tailwindcss.com) (for styling)
- [Lucide React](https://lucide.dev) (icons)
- [uuid](https://www.npmjs.com/package/uuid)
- [axios](https://axios-http.com)

## Project Structure

- `app/` - Next.js app directory (main pages and layout)
- `components/` - UI components
- `lib/` - API utilities and context management
- `src/` - Types and config
- `.env.local` - Environment variables (not committed)

##