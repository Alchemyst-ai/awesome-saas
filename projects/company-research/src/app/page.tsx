'use client';
import { useState } from 'react';

// Define types for our data
interface CompanyInfo {
  name: string;
  symbol: string;
  exchange: string;
  currency: string;
  sector: string;
  industry: string;
  country: string;
}

interface FinancialData {
  overview: {
    MarketCapitalization: string;
    PERatio: string;
    ProfitMargin: string;
    RevenueTTM: string;
    EBITDA: string;
    EPS: string;
    DividendYield: string;
    '52WeekHigh': string;
    '52WeekLow': string;
    Beta: string;
    QuarterlyEarningsGrowthYOY: string;
    QuarterlyRevenueGrowthYOY: string;
  };
  currentQuote: {
    '05. price': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface Report {
  companyInfo: CompanyInfo;
  financialData: FinancialData;
  aiAnalysis: string;
  timestamp: string;
}

export default function Home() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');

  const analyzeCompany = async () => {
    if (!companyName.trim()) return;
    
    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName: companyName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed. Please try again.');
      }

      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">Company Research Agent</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get comprehensive AI-powered analysis of any public company using Alpha Vantage and Gemini AI
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-[#212121] rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <label htmlFor="company-search" className="block text-sm font-large text-white mb-2">
                Company Name or Ticker Symbol
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    id="company-search"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Apple, Microsoft, TSLA, GOOGL..."
                    className="w-full px-4 py-3 bg-transparent text-white border border-white rounded-lg focus:ring-2 focus:ring-[#2E6F40] focus:border-[#2E6F40] transition-all duration-200 placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && analyzeCompany()}
                  />
                </div>
                <button
                  onClick={analyzeCompany}
                  disabled={loading || !companyName.trim()}
                  className="px-8 py-3 bg-[#2E6F40] text-white rounded-lg hover:bg-[#256635] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-200">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {report && (
          <div className="bg-[#212121] rounded-2xl shadow-xl p-8 border border-gray-700">
            {/* Company Header */}
            <div className="border-b border-gray-600 pb-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {report.companyInfo.name} 
                    <span className="text-[#2E6F40] ml-2">({report.companyInfo.symbol})</span>
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      {report.companyInfo.exchange}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {report.companyInfo.currency}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {report.companyInfo.industry}
                    </span>
                  </div>
                </div>
                <div className="bg-[#2E6F40] px-4 py-2 rounded-lg border border-[#3a7a4c]">
                  <span className="text-white font-medium">Analysis Complete</span>
                </div>
              </div>
            </div>

            {/* Current Price Section */}
            {report.financialData.currentQuote && (
              <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Current Price</h3>
                    <p className="text-3xl font-bold text-white">
                      ${report.financialData.currentQuote['05. price']}
                    </p>
                  </div>
                  <div className={`text-lg font-semibold ${parseFloat(report.financialData.currentQuote['09. change']) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {report.financialData.currentQuote['09. change']} ({report.financialData.currentQuote['10. change percent']})
                  </div>
                </div>
              </div>
            )}

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-6 rounded-xl border border-blue-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-300">Market Cap</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {report.financialData.overview.MarketCapitalization 
                    ? `$${(parseInt(report.financialData.overview.MarketCapitalization) / 1000000000).toFixed(1)}B`
                    : 'N/A'
                  }
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 p-6 rounded-xl border border-green-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-300">P/E Ratio</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {report.financialData.overview.PERatio || 'N/A'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 p-6 rounded-xl border border-purple-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-purple-300">Profit Margin</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {report.financialData.overview.ProfitMargin || 'N/A'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 p-6 rounded-xl border border-orange-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-orange-300">Revenue (TTM)</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {report.financialData.overview.RevenueTTM 
                    ? `$${(parseInt(report.financialData.overview.RevenueTTM) / 1000000000).toFixed(1)}B`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm text-gray-400 mb-1">EPS</h4>
                <p className="text-lg font-semibold text-white">{report.financialData.overview.EPS || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm text-gray-400 mb-1">Dividend Yield</h4>
                <p className="text-lg font-semibold text-white">{report.financialData.overview.DividendYield || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm text-gray-400 mb-1">Beta</h4>
                <p className="text-lg font-semibold text-white">{report.financialData.overview.Beta || 'N/A'}</p>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">AI Analysis Report</h3>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div 
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: report.aiAnalysis
                        .replace(/\n/g, '<br>')
                        .replace(/# (.*?)\n/g, '<h3 class="text-xl font-bold text-white mt-6 mb-4">$1</h3>')
                        .replace(/## (.*?)\n/g, '<h4 class="text-lg font-semibold text-gray-200 mt-4 mb-3">$1</h4>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
                        .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4 mb-2 text-gray-300">$1</li>')
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
              <button className="flex-1 px-6 py-3 bg-[#2E6F40] text-white rounded-lg hover:bg-[#256635] transition-colors font-medium">
                Export as PDF
              </button>
              <button 
                onClick={() => {
                  setReport(null);
                  setCompanyName('');
                }}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Analyze Another Company
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}