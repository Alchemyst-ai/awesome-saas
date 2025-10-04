import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Interfaces based on Alpha Vantage response format
export interface CompanyOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  FullTimeEmployees: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  SharesOutstanding: string;
  SharesFloat: string;
  SharesShort: string;
  SharesShortPriorMonth: string;
  ShortRatio: string;
  ShortPercent: string;
  ForwardAnnualDividendRate: string;
  ForwardAnnualDividendYield: string;
  PayoutRatio: string;
  DividendDate: string;
  ExDividendDate: string;
  LastSplitFactor: string;
  LastSplitDate: string;
}

export interface SearchResult {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

export interface GlobalQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export interface EarningsData {
  symbol: string;
  annualEarnings: Array<{
    fiscalDateEnding: string;
    reportedEPS: string;
  }>;
  quarterlyEarnings: Array<{
    fiscalDateEnding: string;
    reportedDate: string;
    reportedEPS: string;
    estimatedEPS: string;
    surprise: string;
    surprisePercentage: string;
  }>;
}

export interface IncomeStatement {
  symbol: string;
  annualReports: Array<{
    fiscalDateEnding: string;
    reportedCurrency: string;
    grossProfit: string;
    totalRevenue: string;
    costOfRevenue: string;
    costofGoodsAndServicesSold: string;
    operatingIncome: string;
    sellingGeneralAndAdministrative: string;
    researchAndDevelopment: string;
    operatingExpenses: string;
    investmentIncomeNet: string;
    netInterestIncome: string;
    interestIncome: string;
    interestExpense: string;
    nonInterestIncome: string;
    otherNonOperatingIncome: string;
    depreciation: string;
    depreciationAndAmortization: string;
    incomeBeforeTax: string;
    incomeTaxExpense: string;
    interestAndDebtExpense: string;
    netIncomeFromContinuingOperations: string;
    comprehensiveIncomeNetOfTax: string;
    ebit: string;
    ebitda: string;
    netIncome: string;
  }>;
  quarterlyReports: Array<{
    fiscalDateEnding: string;
    reportedCurrency: string;
    grossProfit: string;
    totalRevenue: string;
    costOfRevenue: string;
    costofGoodsAndServicesSold: string;
    operatingIncome: string;
    sellingGeneralAndAdministrative: string;
    researchAndDevelopment: string;
    operatingExpenses: string;
    investmentIncomeNet: string;
    netInterestIncome: string;
    interestIncome: string;
    interestExpense: string;
    nonInterestIncome: string;
    otherNonOperatingIncome: string;
    depreciation: string;
    depreciationAndAmortization: string;
    incomeBeforeTax: string;
    incomeTaxExpense: string;
    interestAndDebtExpense: string;
    netIncomeFromContinuingOperations: string;
    comprehensiveIncomeNetOfTax: string;
    ebit: string;
    ebitda: string;
    netIncome: string;
  }>;
}

export interface NewsSentiment {
  items: string;
  sentiment_score_definition: string;
  relevance_score_definition: string;
  feed: Array<{
    title: string;
    url: string;
    time_published: string;
    authors: string[];
    summary: string;
    banner_image: string;
    source: string;
    category_within_source: string;
    source_domain: string;
    topics: Array<{
      topic: string;
      relevance_score: string;
    }>;
    overall_sentiment_score: number;
    overall_sentiment_label: string;
    ticker_sentiment: Array<{
      ticker: string;
      relevance_score: string;
      ticker_sentiment_score: string;
      ticker_sentiment_label: string;
    }>;
  }>;
}

export class AlphaVantageService {
  private static async makeRequest(functionName: string, params: any = {}) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: functionName,
          ...params,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      });
      
      // Check for API limits or errors
      if (response.data.Note || response.data.Information) {
        console.warn('Alpha Vantage API limit:', response.data.Note || response.data.Information);
        return null;
      }
      
      if (response.data['Error Message']) {
        console.error('Alpha Vantage API error:', response.data['Error Message']);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Alpha Vantage ${functionName} error:`, error);
      return null;
    }
  }

  static async getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
    const data = await this.makeRequest('OVERVIEW', { symbol });
    return data as CompanyOverview;
  }

  static async searchCompanies(keywords: string): Promise<SearchResult[]> {
    const data = await this.makeRequest('SYMBOL_SEARCH', { keywords });
    return data?.bestMatches || [];
  }

  static async getGlobalQuote(symbol: string): Promise<GlobalQuote | null> {
    const data = await this.makeRequest('GLOBAL_QUOTE', { symbol });
    return data?.['Global Quote'] || null;
  }

  static async getEarnings(symbol: string): Promise<EarningsData | null> {
    const data = await this.makeRequest('EARNINGS', { symbol });
    return data as EarningsData;
  }

  static async getIncomeStatement(symbol: string): Promise<IncomeStatement | null> {
    const data = await this.makeRequest('INCOME_STATEMENT', { symbol });
    return data as IncomeStatement;
  }

  static async getNewsSentiment(symbol: string): Promise<NewsSentiment | null> {
    const data = await this.makeRequest('NEWS_SENTIMENT', { 
      tickers: symbol,
      topics: 'technology,earnings,financial_markets'
    });
    return data as NewsSentiment;
  }

  static async getBalanceSheet(symbol: string) {
    const data = await this.makeRequest('BALANCE_SHEET', { symbol });
    return data;
  }

  static async getCashFlow(symbol: string) {
    const data = await this.makeRequest('CASH_FLOW', { symbol });
    return data;
  }
}