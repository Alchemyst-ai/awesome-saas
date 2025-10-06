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

  const formatNumber = (num: string) => {
    if (!num) return 'N/A';
    const number = parseFloat(num);
    if (isNaN(number)) return num;
    
    if (number >= 1000000000) {
      return `$${(number / 1000000000).toFixed(2)}B`;
    } else if (number >= 1000000) {
      return `$${(number / 1000000).toFixed(2)}M`;
    } else if (number >= 1000) {
      return `$${(number / 1000).toFixed(2)}K`;
    }
    return `$${number.toFixed(2)}`;
  };

  const formatPercent = (value: string) => {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return `${(num * 100).toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Company Research AI</h1>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
            </div>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Get comprehensive AI-powered analysis of any public company with real-time financial data and intelligent insights
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto">
            <div className="mb-2">
              <label htmlFor="company-search" className="block text-sm font-semibold text-gray-200 mb-3">
                Enter Company Name or Ticker Symbol
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="company-search"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Apple, Microsoft, TSLA, GOOGL..."
                    className="w-full px-6 py-4 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-lg shadow-inner"
                    onKeyPress={(e) => e.key === 'Enter' && analyzeCompany()}
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={analyzeCompany}
                  disabled={loading || !companyName.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center gap-3 min-w-[140px] shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-3 animate-pulse">
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
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 backdrop-blur-sm animate-fade-in">
            {/* Company Header */}
            <div className="border-b border-gray-600 pb-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {report.companyInfo.name} 
                    <span className="text-blue-400 ml-3 font-mono">({report.companyInfo.symbol})</span>
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      {report.companyInfo.exchange}
                    </span>
                    <span className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {report.companyInfo.currency}
                    </span>
                    <span className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {report.companyInfo.industry}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-lg border border-emerald-500 shadow-lg">
                  <span className="text-white font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Analysis Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Current Price Section */}
            {report.financialData.currentQuote && (
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl border border-gray-600 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Current Market Price</h3>
                    <p className="text-4xl font-bold text-white">
                      ${parseFloat(report.financialData.currentQuote['05. price']).toFixed(2)}
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${parseFloat(report.financialData.currentQuote['09. change']) >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-2`}>
                    {parseFloat(report.financialData.currentQuote['09. change']) >= 0 ? '↗' : '↘'}
                    {report.financialData.currentQuote['09. change']} ({report.financialData.currentQuote['10. change percent']})
                  </div>
                </div>
              </div>
            )}

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Market Cap */}
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-6 rounded-xl border border-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-300">Market Cap</h3>
                </div>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatNumber(report.financialData.overview.MarketCapitalization)}
                </p>
                <p className="text-sm text-blue-200">Total company value</p>
              </div>

              {/* P/E Ratio */}
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 p-6 rounded-xl border border-green-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-300">P/E Ratio</h3>
                </div>
                <p className="text-2xl font-bold text-white mb-1">
                  {report.financialData.overview.PERatio || 'N/A'}
                </p>
                <p className="text-sm text-green-200">Valuation multiple</p>
              </div>

              {/* Profit Margin */}
              <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 p-6 rounded-xl border border-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-purple-300">Profit Margin</h3>
                </div>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatPercent(report.financialData.overview.ProfitMargin)}
                </p>
                <p className="text-sm text-purple-200">Net profitability</p>
              </div>

              {/* Revenue */}
              <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 p-6 rounded-xl border border-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-orange-300">Revenue (TTM)</h3>
                </div>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatNumber(report.financialData.overview.RevenueTTM)}
                </p>
                <p className="text-sm text-orange-200">Annual sales</p>
              </div>
            </div>

            {/* Additional Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                <h4 className="text-sm text-gray-400 mb-1">EPS</h4>
                <p className="text-lg font-semibold text-white">{report.financialData.overview.EPS || 'N/A'}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                <h4 className="text-sm text-gray-400 mb-1">Dividend Yield</h4>
                <p className="text-lg font-semibold text-white">{formatPercent(report.financialData.overview.DividendYield)}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                <h4 className="text-sm text-gray-400 mb-1">Beta</h4>
                <p className="text-lg font-semibold text-white">{report.financialData.overview.Beta || 'N/A'}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                <h4 className="text-sm text-gray-400 mb-1">52W High</h4>
                <p className="text-lg font-semibold text-white">${report.financialData.overview['52WeekHigh'] || 'N/A'}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                <h4 className="text-sm text-gray-400 mb-1">52W Low</h4>
                <p className="text-lg font-semibold text-white">${report.financialData.overview['52WeekLow'] || 'N/A'}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                <h4 className="text-sm text-gray-400 mb-1">Revenue Growth</h4>
                <p className="text-lg font-semibold text-white">{formatPercent(report.financialData.overview.QuarterlyRevenueGrowthYOY)}</p>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-8 border border-gray-600 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">AI Analysis Report</h3>
                  <p className="text-gray-400">Powered by Alchemyst AI</p>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-inner">
                <div 
                  className="text-gray-300 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ 
                    __html: report.aiAnalysis
                      .split('\n\n').map(paragraph => {
                        if (paragraph.startsWith('# ')) {
                          return `<h4 class="text-xl font-bold text-white mt-6 mb-4 pb-2 border-b border-gray-700">${paragraph.substring(2)}</h4>`;
                        } else if (paragraph.startsWith('## ')) {
                          return `<h5 class="text-lg font-semibold text-gray-200 mt-5 mb-3">${paragraph.substring(3)}</h5>`;
                        } else if (paragraph.startsWith('- ')) {
                          const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                          return `<ul class="list-disc list-inside space-y-2 ml-4">${items.map(item => 
                            `<li class="text-gray-300">${item.substring(2)}</li>`
                          ).join('')}</ul>`;
                        } else if (paragraph.startsWith('**')) {
                          return `<div class="bg-blue-900/30 border border-blue-700 rounded-lg p-4 my-4"><strong class="text-blue-300">${paragraph.replace(/\*\*/g, '')}</strong></div>`;
                        } else {
                          return `<p class="mb-4">${paragraph}</p>`;
                        }
                      }).join('')
                  }} 
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-700">
              <button 
                onClick={() => window.print()}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Export as PDF
              </button>
              <button 
                onClick={() => {
                  setReport(null);
                  setCompanyName('');
                }}
                className="flex-1 px-6 py-4 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 font-semibold flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Analyze Another Company
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {!report && (
          <div className="text-center mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400">
              Powered by Alpha Vantage & Alchemyst AI • Real-time financial data with intelligent analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}