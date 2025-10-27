````markdown
# 🧪 Alchemyst AI CLI (Python SDK)

A Python command-line tool that uses **Alchemyst AI** for contextual code understanding and **Google Gemini** for intelligent responses.

---

## 🚀 Features
- Searches relevant code context using Alchemyst AI.  
- Uses Gemini to answer project-related questions.  
- Falls back to general knowledge when context is insufficient.  

---

## ⚙️ Setup

### 1. Clone and install
```bash
git clone "https://github.com/Alchemyst-ai/awesome-saas"
cd agents/alchemystai-python-SDK
pip install -r requirements.txt
````

### 2. Add environment variables

Create a `.env` file:

```bash
ALCHEMYST_AI_API_KEY=your_alchemyst_api_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🧩 Run the CLI

```bash
python server.py
```

### Then type your questions interactively:

```
> What does the login_user function do?
```

### To exit:

```
exit | quit | bye
```

---

## 🧠 Tech Stack

* [Alchemyst AI Python SDK](https://docs.getalchemystai.com/integrations/sdk/python-sdk)
* [Google Generative AI SDK](https://cloud.google.com/vertex-ai/generative-ai/docs/sdks/overview)
* Python 3.8+


