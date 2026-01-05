# 🧪 GitAlchemy

<p align="center">
  <strong>Transform code into knowledge with AI</strong>
</p>

<p align="center">
  <em>An intelligent codebase explorer that helps you understand any GitHub repository through AI-powered chat and auto-generated documentation.</em>
</p>

---

## ✨ Features

### 🔍 **AI-Powered Code Chat**
Ask questions about any codebase and get intelligent, context-aware answers. GitAlchemy uses RAG (Retrieval-Augmented Generation) to search through repository code and provide accurate explanations with source citations.

### 📚 **Auto-Generated Documentation**
Automatically generate comprehensive documentation for any repository, including:
- **Introduction** - High-level overview of the project
- **Quick Start** - Get up and running quickly
- **Architecture** - Understand the codebase structure

### 🚀 **Easy Repository Ingestion**
Simply paste a GitHub URL or `owner/repo` format to instantly index and explore any public repository. Supports multiple file types including TypeScript, JavaScript, Python, Go, Rust, and more.

### 💾 **Persistent Knowledge Base**
Ingested repositories are stored in your knowledge base, allowing you to return and continue exploring without re-indexing.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) |
| **UI Components** | [Radix UI](https://radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) |
| **AI/RAG** | [Alchemyst AI SDK](https://alchemyst.ai) |
| **LLM** | [OpenRouter](https://openrouter.ai) |
| **Markdown** | react-markdown, KaTeX, Syntax Highlighting |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ or [Bun](https://bun.sh)
- A GitHub Personal Access Token (for API access)
- An [Alchemyst AI](https://alchemyst.ai) API key
- An [OpenRouter](https://openrouter.ai) API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/GitAlchemy.git
   cd GitAlchemy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   ALCHEMYST_AI_API_KEY=your_alchemyst_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage

### Exploring a Repository

1. **Enter a repo URL** - On the home page, paste a GitHub URL (e.g., `https://github.com/vercel/next.js`) or use the shorthand format (`vercel/next.js`).

2. **Wait for ingestion** - GitAlchemy will fetch and index the repository's code files.

3. **Browse documentation** - View auto-generated documentation sections for the repository.

4. **Chat with the codebase** - Ask questions like:
   - *"How does the routing system work?"*
   - *"What design patterns are used in this project?"*
   - *"Explain the authentication flow"*

### Supported File Types

GitAlchemy indexes the following file types:
- **Code**: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.java`, `.rs`, `.c`, `.cpp`, `.h`, `.sql`
- **Config**: `.json`, `.yml`, `.yaml`, `.prisma`, `.env.example`
- **Docs**: `.md`, `.mdx`

---

## 📁 Project Structure

```
GitAlchemy/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/          # AI chat endpoint
│   │   │   ├── docs/          # Documentation persistence
│   │   │   ├── generate-docs/ # Doc generation endpoint
│   │   │   └── ingest/        # Repository ingestion
│   │   ├── [owner]/[repo]/    # Dynamic repo pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── hero-section.tsx   # Landing page hero
│   │   ├── repo-chat.tsx      # Chat interface
│   │   └── repo-documentation.tsx # Docs viewer
│   └── lib/
│       ├── alchemyst.ts       # Alchemyst AI client
│       └── utils.ts           # Utility functions
├── .env.example               # Environment template
├── package.json
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token for API requests | ✅ Yes |
| `ALCHEMYST_AI_API_KEY` | Alchemyst AI API key for RAG functionality | ✅ Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access | ✅ Yes |

### Getting API Keys

1. **GitHub Token**: [Create a Personal Access Token](https://github.com/settings/tokens) with `repo` scope
2. **Alchemyst AI**: Sign up at [alchemyst.ai](https://alchemyst.ai) to get your API key
3. **OpenRouter**: Create an account at [openrouter.ai](https://openrouter.ai) for LLM access

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Alchemyst AI](https://alchemyst.ai) - For the powerful RAG SDK
- [OpenRouter](https://openrouter.ai) - For LLM access
- [shadcn/ui](https://ui.shadcn.com) - For beautiful UI components
- [Vercel](https://vercel.com) - For Next.js and hosting

---

<p align="center">
  Made with ❤️ by the Alchemyst AI team
</p>
