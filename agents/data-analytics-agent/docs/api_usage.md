# API Usage Documentation

## Alchemyst AI Integration

This document details how the Data Analytics Agent integrates with the Alchemyst AI Platform.

## Table of Contents

- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Core Features](#core-features)
- [Code Examples](#code-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Authentication

### API Key Setup

The agent uses bearer token authentication with the Alchemyst AI Platform.

```python
import os
from dotenv import load_dotenv

load_dotenv()
ALCHEMYST_API_KEY = os.getenv("ALCHEMYST_API_KEY")
```

### Environment Configuration

Required environment variables:

```env
# Required
ALCHEMYST_API_KEY=your_api_key_here

# Optional
ALCHEMYST_BASE_URL=https://platform-backend.getalchemystai.com/api/v1
DEFAULT_MODEL=gpt-4
MAX_TOKENS=2000
```

### Getting an API Key

1. Visit [Alchemyst AI Platform](https://platform.getalchemystai.com)
2. Create an account or log in
3. Navigate to API Settings
4. Generate a new API key
5. Copy and save in your `.env` file

## API Endpoints

### Chat Generation Endpoint

**URL:** `POST /chat/generate`

Used for non-streaming AI responses.

```python
url = "https://platform-backend.getalchemystai.com/api/v1/chat/generate"
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {ALCHEMYST_API_KEY}'
}
data = {
    'chat_history': [
        {'content': prompt, 'role': 'user'}
    ],
    'persona': 'maya'
}
response = requests.post(url, headers=headers, json=data)
```

### Streaming Endpoint

**URL:** `POST /chat/generate/stream`

Used for real-time streaming responses.

```python
url = "https://platform-backend.getalchemystai.com/api/v1/chat/generate/stream"
response = requests.post(url, headers=headers, json=data, stream=True)

for line in response.iter_lines():
    if line:
        decoded = line.decode('utf-8')
        if decoded.startswith('data: '):
            json_data = json.loads(decoded[6:])
            content = json_data.get('content', '')
```

## Core Features

### 1. Data Summarization

Generate comprehensive summaries of datasets.

```python
from ai_insights import AlchemystInsights

ai = AlchemystInsights(api_key="your_key")
summary = ai.generate_summary(dataframe)
```

**Prompt Structure:**
```python
prompt = f"""You are an expert data analyst. Analyze this dataset and provide a comprehensive summary.

**DATASET OVERVIEW:**
- Total rows: {len(df)}
- Total columns: {len(df.columns)}
- Columns: {', '.join(df.columns.tolist())}

**DATA TYPES:**
{json.dumps(dtypes_dict, indent=2)}

**STATISTICAL SUMMARY:**
{json.dumps(stats_dict, indent=2)}

**SAMPLE DATA:**
{df.head().to_json(orient='records', indent=2)}

Provide:
1. Executive Summary
2. Key Insights
3. Data Quality Assessment
4. Notable Patterns
5. Recommendations
"""
```

### 2. Pattern Detection

Identify patterns, trends, and anomalies in specific columns.

```python
patterns = ai.detect_patterns(dataframe, column_name)
```

**Prompt Structure:**
```python
prompt = f"""Analyze this column from a dataset and identify patterns.

**COLUMN:** {column}
**DATA TYPE:** {col_type}
**STATISTICS:**
{stats_info}

**TOP VALUES:**
{value_counts_json}

Provide:
1. Pattern Identification
2. Trend Analysis
3. Anomalies
4. Business Insights
5. Recommendations
"""
```

### 3. Correlation Explanation

Explain relationships between columns in business terms.

```python
explanation = ai.explain_correlation(dataframe, col1, col2)
```

**Prompt Structure:**
```python
prompt = f"""Analyze the relationship between these two variables.

**VARIABLE 1:** {col1}
**VARIABLE 2:** {col2}
**CORRELATION:** {correlation_value}

**SAMPLE DATA:**
{sample_data_json}

Provide:
1. Relationship Type
2. Strength Assessment
3. Business Interpretation
4. Causation vs Correlation
5. Actionable Insights
"""
```

### 4. Natural Language Queries

Answer questions about data in plain English.

```python
answer = ai.answer_query(dataframe, "What are the top 5 products by revenue?")
```

**Prompt Structure:**
```python
prompt = f"""You are a data analyst assistant. Answer the user's question.

**DATASET CONTEXT:**
- Shape: {df.shape}
- Columns: {df.columns.tolist()}

**SAMPLE DATA:**
{df.head(10).to_json()}

**USER QUESTION:**
{question}

Provide a clear, data-driven answer with specific values.
"""
```

## Code Examples

### Complete Integration Example

```python
from analyzer import DataAnalyzer
from ai_insights import AlchemystInsights

# Initialize components
analyzer = DataAnalyzer()
df = analyzer.load_data("sales_data.csv")

# Get basic statistics
stats = analyzer.get_basic_stats()

# Initialize AI
ai = AlchemystInsights()

# Generate summary
summary = ai.generate_summary(df)
print("AI Summary:", summary)

# Detect patterns in a column
patterns = ai.detect_patterns(df, 'revenue')
print("Patterns:", patterns)

# Answer a question
answer = ai.answer_query(df, "What's the average revenue by region?")
print("Answer:", answer)
```

### Custom Prompt Example

```python
from ai_insights import AlchemystInsights

ai = AlchemystInsights()

# Custom prompt
custom_prompt = """
Analyze this sales dataset and identify:
1. Top performing products
2. Seasonal trends
3. Regional disparities
4. Growth opportunities

Data: {data_summary}
"""

response = ai._generate_response(custom_prompt)
```

### Batch Processing Example

```python
# Process multiple datasets
datasets = ['sales.csv', 'customers.csv', 'products.csv']

ai = AlchemystInsights()
results = {}

for dataset_path in datasets:
    analyzer = DataAnalyzer()
    df = analyzer.load_data(dataset_path)
    
    summary = ai.generate_summary(df)
    results[dataset_path] = summary

# Combine insights
print("Combined Analysis:", results)
```

## Error Handling

### API Errors

```python
from ai_insights import AlchemystInsights

try:
    ai = AlchemystInsights()
    summary = ai.generate_summary(df)
except ValueError as e:
    print(f"Configuration error: {e}")
    # Handle missing API key
except requests.exceptions.RequestException as e:
    print(f"API request failed: {e}")
    # Handle network errors
except Exception as e:
    print(f"Unexpected error: {e}")
    # Handle other errors
```

### Timeout Handling

```python
url = f"{self.base_url}/chat/generate"
response = requests.post(
    url,
    headers=self.headers,
    json=data,
    timeout=120  # 2 minute timeout
)
```

### Rate Limiting

```python
import time

def generate_with_retry(ai, df, max_retries=3):
    for attempt in range(max_retries):
        try:
            return ai.generate_summary(df)
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:  # Rate limit
                wait_time = 2 ** attempt  # Exponential backoff
                time.sleep(wait_time)
            else:
                raise
    raise Exception("Max retries exceeded")
```

## Best Practices

### 1. Optimize Prompts

**Do:**
- Include relevant context
- Be specific about requirements
- Provide data samples
- Use structured formatting

**Don't:**
- Send entire large datasets
- Use vague questions
- Mix multiple unrelated queries
- Ignore data types

### 2. Data Preparation

```python
# Prepare data before sending to AI
def prepare_data_for_ai(df):
    # Limit sample size
    sample = df.head(50)
    
    # Remove sensitive columns
    safe_columns = [col for col in df.columns if not col.startswith('_')]
    sample = sample[safe_columns]
    
    # Convert to JSON
    return sample.to_json(orient='records')
```

### 3. Response Parsing

```python
def parse_ai_response(response):
    """Parse and structure AI responses"""
    sections = {}
    current_section = None
    
    for line in response.split('\n'):
        if line.startswith('**') and line.endswith('**'):
            current_section = line.strip('*')
            sections[current_section] = []
        elif current_section:
            sections[current_section].append(line)
    
    return sections
```

### 4. Caching Responses

```python
import functools
import hashlib
import json

def cache_ai_response(func):
    """Cache AI responses to reduce API calls"""
    cache = {}
    
    @functools.wraps(func)
    def wrapper(self, df, *args, **kwargs):
        # Create cache key from data hash
        data_hash = hashlib.md5(
            df.to_json().encode()
        ).hexdigest()
        
        if data_hash in cache:
            return cache[data_hash]
        
        result = func(self, df, *args, **kwargs)
        cache[data_hash] = result
        return result
    
    return wrapper

# Usage
@cache_ai_response
def generate_summary(self, df):
    # ... implementation
    pass
```

### 5. Cost Optimization

```python
# Limit tokens to control costs
def generate_cost_effective_summary(ai, df):
    # Sample data instead of full dataset
    sample_size = min(100, len(df))
    sample_df = df.sample(n=sample_size)
    
    # Use shorter prompts
    short_prompt = f"""
    Analyze this {len(df)} row dataset.
    Columns: {', '.join(df.columns)}
    Provide: key insights, trends, issues.
    """
    
    return ai._generate_response(short_prompt)
```

## API Response Formats

### Standard Response

```json
{
  "content": "Analysis results...",
  "model": "gpt-4",
  "tokens_used": 1500,
  "persona": "maya"
}
```

### Streaming Response

```
data: {"content": "Analysis", "delta": "Analysis"}
data: {"content": " results", "delta": " results"}
data: {"content": "...", "delta": "..."}
data: [DONE]
```

### Error Response

```json
{
  "error": {
    "message": "Invalid API key",
    "type": "authentication_error",
    "code": 401
  }
}
```

## Rate Limits and Quotas

### Default Limits
- Requests per minute: 60
- Tokens per request: 4000
- Concurrent requests: 5

### Handling Limits

```python
from time import sleep
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, max_per_minute=60):
        self.max_per_minute = max_per_minute
        self.requests = []
    
    def wait_if_needed(self):
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Remove old requests
        self.requests = [r for r in self.requests if r > minute_ago]
        
        if len(self.requests) >= self.max_per_minute:
            sleep_time = (self.requests[0] - minute_ago).total_seconds()
            sleep(sleep_time)
        
        self.requests.append(now)

# Usage
limiter = RateLimiter()

for dataset in datasets:
    limiter.wait_if_needed()
    summary = ai.generate_summary(dataset)
```

## Testing AI Integration

### Mock Responses

```python
from unittest.mock import Mock, patch

def test_generate_summary():
    mock_response = Mock()
    mock_response.json.return_value = {
        'content': 'Test summary'
    }
    
    with patch('requests.post', return_value=mock_response):
        ai = AlchemystInsights()
        result = ai.generate_summary(test_df)
        assert 'Test summary' in result
```

## Resources

- [Alchemyst AI Platform](https://platform.getalchemystai.com)
- [API Documentation](https://docs.getalchemystai.com)
- [OpenAPI Specification](https://platform-backend.getalchemystai.com/api/v1/docs)
- [Python SDK](https://github.com/alchemyst-ai/python-sdk)
- [Community Discord](https://dub.sh/context-community)

