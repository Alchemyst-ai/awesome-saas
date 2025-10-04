import { GoogleGenerativeAI } from '@google/generative-ai';
import { CompanyOverview, GlobalQuote } from './alphavantage';

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiService {
  static async generateCompanyAnalysis(
    companyData: CompanyOverview, 
    quoteData: GlobalQuote | null
  ): Promise<string> {
    
    // Check if we have the API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI API key is missing');
      return this.getFallbackAnalysis(companyData, quoteData);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = this.buildAnalysisPrompt(companyData, quoteData);
      
      console.log('📝 Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      console.log('✅ Received response from Gemini API');
      return response.text();
      
    } catch (error: any) {
      console.error('❌ Gemini API error details:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
      
      // Return fallback analysis if Gemini fails
      return this.getFallbackAnalysis(companyData, quoteData);
    }
  }

  private static buildAnalysisPrompt(companyData: CompanyOverview, quoteData: GlobalQuote | null): string {
    return `
      Analyze this company based on the provided financial data and create a comprehensive business intelligence report.

      COMPANY: ${companyData.Name} (${companyData.Symbol})
      
      KEY FINANCIAL METRICS:
      - Market Cap: $${parseInt(companyData.MarketCapitalization).toLocaleString()}
      - P/E Ratio: ${companyData.PERatio}
      - Profit Margin: ${companyData.ProfitMargin}
      - Revenue (TTM): $${parseInt(companyData.RevenueTTM).toLocaleString()}
      - EPS: ${companyData.EPS}
      - Dividend Yield: ${companyData.DividendYield}
      - 52-Week High: $${companyData['52WeekHigh']}
      - 52-Week Low: $${companyData['52WeekLow']}
      - Beta: ${companyData.Beta}
      
      BUSINESS INFORMATION:
      - Sector: ${companyData.Sector}
      - Industry: ${companyData.Industry}
      - Country: ${companyData.Country}
      - Exchange: ${companyData.Exchange}
      
      GROWTH METRICS:
      - Quarterly Earnings Growth: ${companyData.QuarterlyEarningsGrowthYOY}
      - Quarterly Revenue Growth: ${companyData.QuarterlyRevenueGrowthYOY}
      
      CURRENT QUOTE DATA:
      ${quoteData ? `
      - Current Price: $${quoteData['05. price']}
      - Change: ${quoteData['09. change']} (${quoteData['10. change percent']})
      ` : 'Current price data unavailable'}

      Please provide a structured analysis with these sections:

      1. **Executive Summary**
         Brief overview of the company's current position and performance.

      2. **Business Overview**
         Analysis of the company's sector, industry position, and business model.

      3. **Financial Health Analysis**
         Deep dive into profitability, valuation metrics, and financial stability.

      4. **Growth Potential & Risks**
         Assessment of growth drivers, market opportunities, and potential risks.

      5. **Investment Perspective**
         Balanced view on the company's investment attractiveness.

      Format the response in clear, professional markdown. Be data-driven and objective.
      Focus on insights that would be valuable for investors and business decision-makers.
    `;
  }

  private static getFallbackAnalysis(companyData: CompanyOverview, quoteData: GlobalQuote | null): string {
    console.log('🔄 Using fallback analysis');
    
    return `
# ${companyData.Name} Analysis Report

## Executive Summary
${companyData.Name} operates in the ${companyData.Sector} sector and shows significant market presence with a market capitalization of $${(parseInt(companyData.MarketCapitalization) / 1000000000).toFixed(1)}B.

## Business Overview
- **Sector**: ${companyData.Sector}
- **Industry**: ${companyData.Industry}
- **Exchange**: ${companyData.Exchange}

## Financial Health Analysis
- **Market Capitalization**: $${(parseInt(companyData.MarketCapitalization) / 1000000000).toFixed(1)}B
- **P/E Ratio**: ${companyData.PERatio || 'N/A'}
- **Profit Margin**: ${companyData.ProfitMargin || 'N/A'}
- **Revenue (TTM)**: $${(parseInt(companyData.RevenueTTM) / 1000000000).toFixed(1)}B

## Growth Potential & Risks
- **EPS**: ${companyData.EPS || 'N/A'}
- **Quarterly Revenue Growth**: ${companyData.QuarterlyRevenueGrowthYOY || 'N/A'}
- **Beta**: ${companyData.Beta || 'N/A'} (Market volatility indicator)

## Investment Perspective
Based on the available financial metrics, further analysis would consider market conditions and comparative industry performance.

*Note: This is a basic analysis. For comprehensive insights, ensure your Gemini API key is properly configured.*
    `;
  }
}