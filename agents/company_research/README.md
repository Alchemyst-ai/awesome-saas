# Company Research AI Agent

A powerful, real-time company research application built with Python, Streamlit, and AlchemystAI's Chat Streaming API. This tool provides comprehensive business intelligence analysis for any company with streaming updates and downloadable reports.

## 🚀 Features

- **Comprehensive Reports**: Detailed company analysis covering:
  - Executive summary and business overview
  - Financial landscape and funding history
  - Competitive analysis and market positioning
  - Demographic insights and target audience
  - Technology stack and operations
  - Market opportunities and risk assessment
- **Downloadable Reports**: Export research findings as text files
- **User-friendly Interface**: Clean, modern Streamlit web interface

## 🛠️ Tech Stack

- **Python** - Backend logic and API integration
- **AlchemystAI Chat API** - AI-powered research engine
- **AlchemystAI SDK** - AI-powered research engine
- **Streamlit** - Web application framework
- **Requests** - HTTP client for API communication

## 📋 Prerequisites

- Python 3.8+
- AlchemystAI API Key
- Gemini API Key

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd company_research

2. **Install the dependencies**
   ```bash
   pip install -r requirements.txt

1. **Setting the API Keys in .env**
   ```bash
   ALCHEMYST_API_KEY = "Your Alchemyst API key"
   GEMINI_API_KEY = "Your Gemini API Key"

3. **Run app.py**
   ```bash
   streamlit run app.py