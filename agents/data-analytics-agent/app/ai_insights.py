"""
AI Insights Module
Purpose: Alchemyst AI integration for generating intelligent data insights
Features:
- Data summarization using Alchemyst AI
- Pattern detection and analysis
- Natural language query answering
- Correlation explanations
@version 1.0
@package data-analytics-agent
@author iamtensaiii
"""

import os
import json
import requests
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

ALCHEMYST_API_KEY = os.getenv("ALCHEMYST_API_KEY")
ALCHEMYST_BASE_URL = os.getenv(
    "ALCHEMYST_BASE_URL",
    "https://platform-backend.getalchemystai.com/api/v1"
)


class AlchemystInsights:
    """
    AlchemystInsights
    Purpose: Generate AI-powered insights using Alchemyst platform
    @property str api_key: Alchemyst API key
    @property str base_url: Alchemyst API base URL
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Alchemyst AI client
        @param str api_key: Optional API key (uses env var if not provided)
        @throws ValueError: When API key is missing
        """
        self.api_key = api_key or ALCHEMYST_API_KEY
        if not self.api_key:
            raise ValueError(
                "ALCHEMYST_API_KEY not found. "
                "Set it in .env file or pass to constructor."
            )
        self.base_url = ALCHEMYST_BASE_URL
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }
    
    def _prepare_request_data(self, prompt: str) -> Dict[str, Any]:
        """Prepare request data for API call"""
        return {
            'chat_history': [
                {'content': prompt, 'role': 'user'}
            ],
            'persona': 'maya'
        }
    
    def _handle_streaming_response(self, response: requests.Response) -> str:
        """Handle streaming response from API"""
        full_response = ""
        for line in response.iter_lines():
            if line:
                try:
                    decoded = line.decode('utf-8')
                    if decoded.startswith('data: '):
                        json_data = json.loads(decoded[6:])
                        if 'content' in json_data:
                            full_response += json_data['content']
                except (json.JSONDecodeError, UnicodeDecodeError, KeyError) as e:
                    # Log the error but continue processing other lines
                    print(f"Warning: Failed to parse streaming response line: {e}")
                    continue
        return full_response
    
    def _handle_regular_response(self, response: requests.Response) -> str:
        """Handle regular (non-streaming) response from API"""
        result = response.json()
        return result.get('content', result.get('response', str(result)))

    def _generate_response(self, prompt: str, stream: bool = False) -> str:
        """
        Generate AI response using Alchemyst chat API
        @param str prompt: Input prompt for AI
        @param bool stream: Whether to use streaming response
        @return str: AI-generated response
        @throws Exception: When API call fails
        """
        try:
            url = f"{self.base_url}/chat/generate/stream" if stream else f"{self.base_url}/chat/generate"
            data = self._prepare_request_data(prompt)
            
            response = requests.post(
                url,
                headers=self.headers,
                json=data,
                timeout=120
            )
            response.raise_for_status()
            
            if stream:
                return self._handle_streaming_response(response)
            else:
                return self._handle_regular_response(response)
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Alchemyst API error: {str(e)}")
        except Exception as e:
            raise Exception(f"Error generating insights: {str(e)}")
    
    def generate_summary(self, df: pd.DataFrame) -> str:
        """
        Generate overall data summary and insights
        @param DataFrame df: Input dataframe to analyze
        @return str: AI-generated summary and key insights
        """
        try:
            stats_dict = df.describe().to_dict()
            cols_info = {
                'columns': df.columns.tolist(),
                'dtypes': df.dtypes.astype(str).to_dict(),
                'null_counts': df.isnull().sum().to_dict()
            }
            
            prompt = f"""You are an expert data analyst. Analyze this dataset and provide a comprehensive summary.

**DATASET OVERVIEW:**
- Total rows: {len(df)}
- Total columns: {len(df.columns)}
- Columns: {', '.join(df.columns.tolist())}

**DATA TYPES:**
{json.dumps(cols_info['dtypes'], indent=2)}

**MISSING VALUES:**
{json.dumps(cols_info['null_counts'], indent=2)}

**STATISTICAL SUMMARY:**
{json.dumps(stats_dict, indent=2)}

**SAMPLE DATA (first 5 rows):**
{df.head().to_json(orient='records', indent=2)}

**ANALYSIS REQUIREMENTS:**
1. **Executive Summary** - High-level overview of the data
2. **Key Insights** - 3-5 notable patterns or trends you observe
3. **Data Quality** - Assessment of completeness and potential issues
4. **Notable Patterns** - Any interesting correlations or anomalies
5. **Recommendations** - Suggested next steps for analysis

Provide actionable insights that would help a business analyst or data scientist."""
            
            return self._generate_response(prompt)
            
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    def detect_patterns(self, df: pd.DataFrame, column: str) -> str:
        """
        Detect patterns in specific column
        @param DataFrame df: Input dataframe
        @param str column: Column name to analyze
        @return str: Pattern analysis and insights
        """
        try:
            if column not in df.columns:
                return f"Error: Column '{column}' not found in dataset"
            
            col_data = df[column].dropna()
            value_counts = col_data.value_counts().head(20).to_dict()
            
            # Get basic stats
            col_type = df[column].dtype
            if pd.api.types.is_numeric_dtype(col_data):
                stats = {
                    'mean': float(col_data.mean()),
                    'median': float(col_data.median()),
                    'std': float(col_data.std()),
                    'min': float(col_data.min()),
                    'max': float(col_data.max())
                }
                stats_info = json.dumps(stats, indent=2)
            else:
                stats_info = f"Unique values: {col_data.nunique()}"
            
            prompt = f"""Analyze this column from a dataset and identify patterns, trends, and insights.

**COLUMN:** {column}
**DATA TYPE:** {col_type}
**STATISTICS:**
{stats_info}

**TOP VALUES/DISTRIBUTION:**
{json.dumps(value_counts, indent=2)}

**SAMPLE VALUES:**
{col_data.head(10).tolist()}

Provide:
1. **Pattern Identification** - What patterns do you see in the data?
2. **Trend Analysis** - Are there any notable trends?
3. **Anomalies** - Any unusual values or outliers?
4. **Business Insights** - What does this data tell us from a business perspective?
5. **Recommendations** - What should be investigated further?"""
            
            return self._generate_response(prompt)
            
        except Exception as e:
            return f"Error detecting patterns: {str(e)}"
    
    def explain_correlation(self, df: pd.DataFrame, col1: str, col2: str) -> str:
        """
        Explain correlation between two columns
        @param DataFrame df: Input dataframe
        @param str col1: First column name
        @param str col2: Second column name
        @return str: Correlation explanation
        """
        try:
            if col1 not in df.columns or col2 not in df.columns:
                return f"Error: One or both columns not found"
            
            # Calculate correlation if numeric
            if pd.api.types.is_numeric_dtype(df[col1]) and pd.api.types.is_numeric_dtype(df[col2]):
                corr_value = df[[col1, col2]].corr().iloc[0, 1]
                corr_info = f"Correlation coefficient: {corr_value:.4f}"
            else:
                corr_info = "Non-numeric data - analyzing categorical relationship"
            
            # Sample data
            sample_data = df[[col1, col2]].head(20).to_dict(orient='records')
            
            prompt = f"""Analyze the relationship between these two variables from a dataset.

**VARIABLE 1:** {col1}
**VARIABLE 2:** {col2}

**CORRELATION INFO:**
{corr_info}

**SAMPLE DATA:**
{json.dumps(sample_data, indent=2)}

**STATISTICS:**
{col1}: {df[col1].describe().to_dict()}
{col2}: {df[col2].describe().to_dict()}

Provide:
1. **Relationship Type** - Describe the relationship (positive, negative, none, non-linear)
2. **Strength Assessment** - How strong is the relationship?
3. **Business Interpretation** - What does this relationship mean?
4. **Causation vs Correlation** - Important notes about causality
5. **Actionable Insights** - How can this inform business decisions?"""
            
            return self._generate_response(prompt)
            
        except Exception as e:
            return f"Error explaining correlation: {str(e)}"
    
    def answer_query(self, df: pd.DataFrame, question: str) -> str:
        """
        Answer natural language questions about the data
        @param DataFrame df: Input dataframe
        @param str question: User's question about the data
        @return str: AI-generated answer
        """
        try:
            # Provide context about the dataset
            context = {
                'shape': df.shape,
                'columns': df.columns.tolist(),
                'dtypes': df.dtypes.astype(str).to_dict(),
                'sample': df.head(10).to_dict(orient='records'),
                'stats': df.describe().to_dict()
            }
            
            prompt = f"""You are a data analyst assistant. Answer the user's question about this dataset.

**DATASET CONTEXT:**
- Shape: {df.shape[0]} rows × {df.shape[1]} columns
- Columns: {', '.join(df.columns.tolist())}

**DATA TYPES:**
{json.dumps(context['dtypes'], indent=2)}

**SAMPLE DATA (first 10 rows):**
{json.dumps(context['sample'], indent=2)}

**STATISTICAL SUMMARY:**
{json.dumps(context['stats'], indent=2)}

**USER QUESTION:**
{question}

**INSTRUCTIONS:**
- Provide a clear, data-driven answer
- Include specific values and metrics from the data
- If the question cannot be answered with available data, explain why
- Suggest related insights if relevant
- Be concise but informative

Answer:"""
            
            return self._generate_response(prompt)
            
        except Exception as e:
            return f"Error answering query: {str(e)}"
    
    def generate_recommendations(self, df: pd.DataFrame, analysis_results: Dict[str, Any]) -> str:
        """
        Generate actionable recommendations based on analysis
        @param DataFrame df: Input dataframe
        @param dict analysis_results: Previous analysis results
        @return str: AI-generated recommendations
        """
        try:
            prompt = f"""Based on the following data analysis, provide actionable business recommendations.

**DATASET INFO:**
- Rows: {len(df)}
- Columns: {len(df.columns)}

**ANALYSIS RESULTS:**
{json.dumps(analysis_results, indent=2)}

Provide:
1. **Top 3 Recommendations** - Specific, actionable next steps
2. **Quick Wins** - Easy improvements that can be made immediately
3. **Long-term Strategies** - Strategic initiatives based on the data
4. **Risk Mitigation** - Potential issues to address
5. **Next Steps** - Specific actions to take

Format as clear, numbered action items."""
            
            return self._generate_response(prompt)
            
        except Exception as e:
            return f"Error generating recommendations: {str(e)}"

