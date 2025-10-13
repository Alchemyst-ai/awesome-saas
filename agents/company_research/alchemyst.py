import requests
import json
import sseclient  
from alchemyst_ai import AlchemystAI
import os
from dotenv import load_dotenv

load_dotenv()

ALCHEMYST_API_KEY = os.getenv("ALCHEMYST_API_KEY")

client = AlchemystAI(
    api_key = ALCHEMYST_API_KEY
)

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

def process_stream_response(response, callback):
    """Process the streaming response with lower complexity"""
    full_content = ""
    send_status(callback, "Starting analysis...")
    
    for line in response.iter_lines():
        if not line:
            continue
            
        content = process_line(line, callback)
        if content == "[STREAM_END]":
            send_status(callback, "Analysis complete!")
            break
        elif content:
            full_content += content
    
    return full_content

def process_line(line, callback):
    """Process a single line from the stream"""
    try:
        line_text = line.decode('utf-8')
        if not line_text.startswith('data:'):
            return ""
            
        data_content = line_text[5:].strip()
        
        if data_content == '[DONE]':
            return "[STREAM_END]"
            
        return parse_data_content(data_content, callback)
        
    except Exception as e:
        send_error(callback, f"Line processing error: {str(e)}")
        return ""

def parse_data_content(data_content, callback):
    """Parse the data content from SSE"""
    try:
        parsed = json.loads(data_content)
        content = parsed.get('content', '')
        if content:
            send_content(callback, content)
            return content
    except json.JSONDecodeError:
        if data_content and data_content != '[DONE]':
            send_content(callback, data_content)
            return data_content + " "
    return ""

def send_status(callback, message):
    """Send status update via callback"""
    if callback:
        callback("status", message)

def send_content(callback, content):
    """Send content via callback and print"""
    if callback:
        callback("status", content)
    print(content, end='', flush=True)

def send_error(callback, error_msg):
    """Send error via callback"""
    if callback:
        callback("error", error_msg)

def handle_error(e, callback):
    """Handle different types of errors"""
    if isinstance(e, requests.exceptions.RequestException):
        error_msg = f"Request failed: {str(e)}"
    else:
        error_msg = f"Unexpected error: {str(e)}"
    
    send_error(callback, error_msg)

def initiate_company_research(companyName: str, callback=None):
    url = 'https://platform-backend.getalchemystai.com/api/v1/chat/generate/stream'
    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {ALCHEMYST_API_KEY}'}
    data = {'chat_history': [{'content': getPromptForCompanyResearch(companyName=companyName), 'role': 'user'}], 'persona': 'maya'}
    
    try:
        response = requests.post(url, headers=headers, json=data, stream=True, timeout=300)
        response.raise_for_status()
        return process_stream_response(response, callback)
    except Exception as e:
        handle_error(e, callback)
        return ""

def add_content():

    docs_array = [{
        "content": "files content",
        "metadata": {   # optional
            "filename": "name of the file",
            "filetype": "pdf/txt/json"
        }
    }]

    response = client.v1.context.add(
    documents=docs_array,
    source="source of context data",
    context_type="resource",
    scope="internal", 
    metadata={
        "fileName": "file_name",
        "fileType": "type",
        "lastModified": "timestamp",
        "fileSize": 1234,
    }
)