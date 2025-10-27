# 🧪 Alchemyst AI CLI

A simple Node.js command-line tool that uses **Alchemyst AI** for contextual search and **Google Gemini** for AI-powered responses.

---

## 🚀 Features
- Ask natural language questions directly in your terminal.  
- Searches for relevant context from Alchemyst AI before answering.  
- Falls back to Gemini’s general knowledge when no context is found.  

---

## ⚙️ Setup

### 1. Clone and install
```bash
git clone "https://github.com/Alchemyst-ai/awesome-saas"
cd  agents/alchemystai-ts-SDK
npm install
```

### 2. Add environment variables

Create a .env file:

```bash
ALCHEMYST_AI_API_KEY=your_alchemyst_api_key
GEMINI_API_KEY=your_gemini_api_key
```
### 3. Run the CLI

```bash
npm run dev
```

### Then type your questions interactively:

💭 Ask me anything: What is vector embedding?


### To exit:

exit | quit | bye | stop

🧠 Tech Stack

- [Alchemyst AI SDK](https://docs.getalchemystai.com/integrations/sdk/typescript-sdk)
- [Google Generative AI SDK](https://cloud.google.com/vertex-ai/generative-ai/docs/sdks/overview)
- Node.js + TypeScript