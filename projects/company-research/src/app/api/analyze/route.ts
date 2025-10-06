import { NextRequest, NextResponse } from 'next/server';
import alchemystService from '../../../lib/alchemyst';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

async function fetchCompanyOverview(symbol: string) {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  return await response.json();
}

async function fetchCompanyQuote(symbol: string) {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  const data = await response.json();
  return data['Global Quote'];
}

async function searchSymbol(companyName: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(companyName)}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.bestMatches && data.bestMatches.length > 0) {
      return data.bestMatches[0]['1. symbol'];
    }
    return null;
  } catch (error) {
    console.error('Symbol search error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting analysis for: ${companyName}`);

    // Search for company symbol
    const symbol = await searchSymbol(companyName);
    
    if (!symbol) {
      return NextResponse.json(
        { error: `Could not find stock symbol for: ${companyName}` },
        { status: 404 }
      );
    }

    // Fetch real financial data from Alpha Vantage
    const [overview, quote] = await Promise.all([
      fetchCompanyOverview(symbol),
      fetchCompanyQuote(symbol)
    ]);

    if (!overview || Object.keys(overview).length === 0) {
      return NextResponse.json(
        { error: `Financial data not available for: ${companyName}` },
        { status: 404 }
      );
    }

    // Generate AI analysis using Alchemyst
    const analysisResult = await alchemystService.researchCompany(companyName, 'comprehensive');

    const response = {
      companyInfo: {
        name: overview.Name || companyName,
        symbol: overview.Symbol || symbol,
        exchange: overview.Exchange || 'N/A',
        currency: overview.Currency || 'USD',
        sector: overview.Sector || 'N/A',
        industry: overview.Industry || 'N/A',
        country: overview.Country || 'N/A'
      },
      financialData: {
        overview: {
          MarketCapitalization: overview.MarketCapitalization,
          PERatio: overview.PERatio,
          ProfitMargin: overview.ProfitMargin,
          RevenueTTM: overview.RevenueTTM,
          EBITDA: overview.EBITDA,
          EPS: overview.EPS,
          DividendYield: overview.DividendYield,
          '52WeekHigh': overview['52WeekHigh'],
          '52WeekLow': overview['52WeekLow'],
          Beta: overview.Beta,
          QuarterlyEarningsGrowthYOY: overview.QuarterlyEarningsGrowthYOY,
          QuarterlyRevenueGrowthYOY: overview.QuarterlyRevenueGrowthYOY
        },
        currentQuote: quote || {
          '05. price': '0',
          '09. change': '0',
          '10. change percent': '0%'
        }
      },
      aiAnalysis: analysisResult.content,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Analysis error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Analysis failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}