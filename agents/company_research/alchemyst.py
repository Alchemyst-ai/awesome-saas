import requests
import json
import sseclient  
import os
from dotenv import load_dotenv

load_dotenv()

ALCHEMYST_API_KEY = os.getenv("ALCHEMYST_API_KEY")

def getPromptForCompanyResearch(companyName: str) -> str:
    return f"""You are an expert business intelligence analyst. Research {companyName} and provide a comprehensive report.

    **RESEARCH STRUCTURE:**
    1. **EXECUTIVE SUMMARY** - Overview, key findings, market position
    2. **COMPANY BACKGROUND** - History, mission, leadership, business model
    3. **DEMOGRAPHIC ANALYSIS** - Target customers, geographic reach, user demographics
    4. **FINANCIAL LANDSCAPE** - Funding, valuation, investors, revenue trends
    5. **DIGITAL FOOTPRINT** - Web traffic, engagement, traffic sources, geographic distribution
    6. **COMPETITIVE ANALYSIS** - Competitors, differentiators, market share, SWOT analysis
    7. **TECHNOLOGY & OPERATIONS** - Tech stack, partnerships, operational capabilities
    8. **MARKET OPPORTUNITIES & RISKS** - Growth potential, trends, regulatory risks, outlook

    **METHODOLOGY:** Use multiple data sources, focus on recent data (1-3 years), include quantitative and qualitative insights.

    **FORMATTING:** Use clear headings, bullet points, tables where appropriate, bold key metrics.

    **DELIVERABLE:** Actionable intelligence for investors and decision-makers.

    Begin research on: {companyName}"""


def initiate_company_research(companyName: str, callback=None):
    url = 'https://platform-backend.getalchemystai.com/api/v1/chat/generate/stream'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {ALCHEMYST_API_KEY}'
    }
    data = {
        'chat_history': [ { 'content': getPromptForCompanyResearch(companyName= companyName), 'role': 'user' } ],
        'persona': 'maya'
    }
    full_content = ""
    try:
        response = requests.post(url, headers=headers, json=data, stream=True, timeout=300)
        response.raise_for_status()
        if callback:
            callback("status", "Starting analysis...")
        for line in response.iter_lines():
            if line:
                try:
                    line_text = line.decode('utf-8')
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