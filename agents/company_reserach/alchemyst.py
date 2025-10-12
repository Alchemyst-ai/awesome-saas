import requests
import json
import sseclient  
import os
from dotenv import load_dotenv

load_dotenv()

ALCHEMYST_API_KEY = os.getenv("ALCHEMYST_API_KEY")

def getPromptForCompanyResearch(companyName: str) -> str:
    return f"""
                You are an expert business intelligence analyst and market research specialist. Your task is to conduct comprehensive research on a company and generate a detailed report.

                **COMPANY TO RESEARCH:** {companyName}

                **RESEARCH OBJECTIVE:**
                Perform deep, multi-faceted analysis covering all critical business aspects including demographics, funding, web presence, and competitive landscape.

                **REPORT STRUCTURE REQUIREMENTS:**

                1. **EXECUTIVE SUMMARY**
                - Company overview and core business
                - Key findings and strategic insights
                - Overall market position assessment

                2. **COMPANY BACKGROUND & IDENTITY**
                - Company history and founding story
                - Mission, vision, and core values
                - Leadership team and organizational structure
                - Business model and revenue streams

                3. **DEMOGRAPHIC ANALYSIS**
                - Target customer segments and personas
                - Geographic reach and market penetration
                - User/customer demographics (age, income, education, etc.)
                - B2B vs B2C focus and customer distribution

                4. **FUNDING & FINANCIAL LANDSCAPE**
                - Total funding raised and valuation history
                - Funding rounds (Seed, Series A, B, C, etc.)
                - Key investors and venture capital backing
                - Revenue trends and financial performance
                - Recent financial developments

                5. **DIGITAL FOOTPRINT & WEB TRAFFIC**
                - Website traffic metrics and growth trends
                - User engagement and behavior patterns
                - Traffic sources breakdown (direct, search, social, referral)
                - Geographic traffic distribution
                - Mobile vs desktop usage trends

                6. **COMPETITIVE ANALYSIS**
                - Main competitors and market positioning
                - Competitive advantages and differentiators
                - Market share analysis
                - SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
                - Competitive threats and market gaps

                7. **TECHNOLOGY & OPERATIONS**
                - Technology stack and infrastructure
                - Key partnerships and ecosystem
                - Operational capabilities and scalability

                8. **MARKET OPPORTUNITIES & RISKS**
                - Growth opportunities and expansion potential
                - Market trends and industry shifts
                - Regulatory and competitive risks
                - Future outlook and predictions

                **RESEARCH METHODOLOGY:**
                - Use multiple data sources for cross-verification
                - Focus on recent and relevant data (last 1-3 years)
                - Include both quantitative metrics and qualitative insights
                - Highlight data-driven patterns and trends

                **FORMATTING REQUIREMENTS:**
                - Use clear headings and subheadings
                - Include bullet points for key findings
                - Use tables for comparative data where appropriate
                - Bold important metrics and insights
                - Include executive summary at the beginning

                **DELIVERABLE:**
                A comprehensive, well-structured research report that provides actionable intelligence for investors, strategists, and business decision-makers.

                Begin your research on: {companyName}
            """

def initiate_company_research(companyName: str, callback=None):
    url = 'https://platform-backend.getalchemystai.com/api/v1/chat/generate/stream'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {ALCHEMYST_API_KEY}'
    }

    data = {
        'chat_history': [
            {
                'content': getPromptForCompanyResearch(companyName= companyName),
                'role': 'user'
            }
        ],
        'persona': 'maya'
    }

    full_content = ""

    try:
        response = requests.post(url, headers=headers, json=data, stream=True, timeout=300)
        response.raise_for_status()

        if callback:
            callback("status", "Starting analysis...")

        # Manual SSE parsing - more reliable than sseclient
        for line in response.iter_lines():
            if line:
                try:
                    line_text = line.decode('utf-8')
                    
                    # Check if it's SSE data line
                    if line_text.startswith('data:'):
                        data_content = line_text[5:].strip()
                        
                        if data_content == '[DONE]':
                            if callback:
                                callback("status","Analysis complete!")
                            break
                        
                        if data_content:
                            try:
                                parsed = json.loads(data_content)
                                content = parsed.get('content', '')
                                
                                if content:
                                    full_content = content
                                    if callback:
                                        callback("status", content)
                                    print(content, end='', flush=True)
                                        
                            except json.JSONDecodeError:
                                # If it's not JSON, use it as plain text
                                if data_content and data_content != '[DONE]':
                                    full_content += data_content + " "
                                    if callback:
                                        callback("status", data_content)
                                    print(data_content, end='', flush=True)
                                    
                except Exception as e:
                    if callback:
                        callback("error", f"⚠️ Line processing error: {str(e)}")
                    continue

        return full_content

    except requests.exceptions.RequestException as e:
        error_msg = f"Request failed: {str(e)}"
        if callback:
            callback("error", error_msg)
        print(error_msg)
        return ""
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        if callback:
            callback("error", error_msg)
        print(error_msg)
        return ""