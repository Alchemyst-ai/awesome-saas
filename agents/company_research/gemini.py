import os
from alchemyst_ai import AlchemystAI
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

llm = ChatGoogleGenerativeAI(
    model = "gemini-2.0-flash",
    google_api_key = GEMINI_API_KEY,
    temperature = 0.7
)

def get_prompt(query: str, context: str):
    return f"""
        Extract company name from: "{query}"

        Using ONLY this context:{context}

        Generate research report with these sections (use ONLY context, state "Not in context" if missing):

        1. **EXECUTIVE SUMMARY**
        2. **COMPANY BACKGROUND** 
        3. **DEMOGRAPHIC ANALYSIS**
        4. **FINANCIAL LANDSCAPE**
        5. **DIGITAL FOOTPRINT**
        6. **COMPETITIVE ANALYSIS**
        7. **TECHNOLOGY & OPERATIONS**
        8. **MARKET OPPORTUNITIES & RISKS**

        Constraints: Strictly use only provided context. No external knowledge.
    """

def generate_research_report(company_query: str, context: str = ""):
    """Generate research report using Gemini LLM"""
    prompt = get_prompt(company_query, context)
    
    try:
        response = llm.invoke(prompt)
        return response.content
    except Exception as e:
        return f"Error generating report: {str(e)}"