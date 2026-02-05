# Demo Chatbot (Alchemyst AI + Memory)

A tiny CLI chatbot that demonstrates:
- Using Alchemyst AI for memory + contextual search
- Answering related questions with Gemini
- Storing each user + assistant turn as searchable memory
- Seeding raw Markdown docs from `agents/chatbot-withmemory/docs`

## Setup

1. Install dependencies
```bash
cd agents/chatbot-withmemory
npm install
```

2. Configure environment

Create a `.env` file:
```bash
ALCHEMYST_AI_API_KEY=your_alchemyst_api_key
GEMINI_API_KEY=your_gemini_api_key
SESSION_ID=demo-session-1
USER_ID=demo-user
```

3. (Optional) Seed docs memory
```bash
npm run seed
```

4. Run the chatbot
```bash
npm run chat
```

## Example prompts
- "How do I implement capture payments?"
- "What are the api endpoints available?"
- "What data types are used in the apis?"

## Notes
- Docs are stored as raw markdown from `agents/chatbot-withmemory/docs`.
- Each user + assistant turn is stored as memory and retrieved on each question.
- If no memory is found, the bot replies using general knowledge.
