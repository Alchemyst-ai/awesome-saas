import { NextRequest, NextResponse } from 'next/server';
import { AlphaVantageService } from '@/lib/alphavantage';
import { GeminiService } from '@/lib/agent';

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName || typeof companyName !== 'string') {
      return NextResponse.json(
        { error: 'Valid company name is required' }, 
        { status: 400 }
      );
    }

    console.log('🔍 Analyzing company:', companyName);

    // Step 1: Search for company symbol
    const searchResults = await AlphaVantageService.searchCompanies(companyName);
    
    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json(
        { error: `No companies found matching "${companyName}". Try using the exact company name or ticker symbol.` }, 
        { status: 404 }
      );
    }

    const bestMatch = searchResults[0];
    const companySymbol = bestMatch['1. symbol'];
    const companyNameFound = bestMatch['2. name'];

    console.log('✅ Found company:', companyNameFound, 'Symbol:', companySymbol);

    // Step 2: Get company data
    const [companyOverview, quoteData] = await Promise.all([
      AlphaVantageService.getCompanyOverview(companySymbol),
      AlphaVantageService.getGlobalQuote(companySymbol)
    ]);

    if (!companyOverview) {
      return NextResponse.json(
        { error: 'Financial data currently unavailable. This may be due to API rate limits. Please try again in a minute.' }, 
        { status: 429 }
      );
    }

    console.log('✅ Got company overview data');

    // Step 3: Generate AI analysis
    console.log('🤖 Generating AI analysis...');
    const aiAnalysis = await GeminiService.generateCompanyAnalysis(companyOverview, quoteData);
    
    console.log('✅ AI analysis generated successfully');

    // Step 4: Return comprehensive report
    const report = {
      companyInfo: {
        name: companyNameFound,
        symbol: companySymbol,
        exchange: bestMatch['4. region'],
        currency: bestMatch['8. currency'],
        sector: companyOverview.Sector,
        industry: companyOverview.Industry,
        country: companyOverview.Country
      },
      financialData: {
        overview: companyOverview,
        currentQuote: quoteData
      },
      aiAnalysis: aiAnalysis,
      timestamp: new Date().toISOString()
    };

    console.log('🎉 Analysis complete for:', companyNameFound);
    return NextResponse.json(report);

  } catch (error) {
    console.error('❌ Analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' }, 
      { status: 500 }
    );
  }
}