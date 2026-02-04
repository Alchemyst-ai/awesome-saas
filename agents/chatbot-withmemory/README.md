# Razorpay Demo Chatbot (Alchemyst AI + Memory)

A tiny CLI chatbot that demonstrates:
- Using Alchemyst AI for memory + contextual search
- Answering related questions with Gemini
- Storing each user + assistant turn as searchable memory

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

3. (Optional) Seed memory
```bash
npm run seed
```

4. Run the chatbot
```bash
npm run chat
```

## Example prompts
- "How do I trigger a refund?"
- "What events should I listen for in webhooks?"
- "Can you explain subscription trials?"

## Notes
- Memory is stored in Alchemyst AI and retrieved on each question.
- If no memory is found, the bot replies using general knowledge.
