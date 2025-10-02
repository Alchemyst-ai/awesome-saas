'use client';
import { useState } from 'react';

// Define types for our data
interface CompanyInfo {
  name: string;
  symbol: string;
  exchange: string;
  currency: string;
}

interface FinancialData {
  overview: {
    MarketCapitalization: string;
    PERatio: string;
    ProfitMargin: string;
    Revenue: string;
    EBITDA: string;
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

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      
      // Create mock data object with proper typing
      const mockReport: Report = {
        companyInfo: {
          name: companyName,
          symbol: 'AAPL',
          exchange: 'NASDAQ',
          currency: 'USD'
        },
        financialData: {
          overview: {
            MarketCapitalization: '2870000000000',
            PERatio: '29.34',
            ProfitMargin: '25.31%',
            Revenue: '383000000000',
            EBITDA: '130000000000'
          }
        },
        aiAnalysis: `# ${companyName} Analysis Report\n\n## Executive Summary\n${companyName} demonstrates strong financial performance with consistent revenue growth and market leadership in their sector.\n\n## Financial Health\n- **Market Cap:** $2.87T\n- **P/E Ratio:** 29.34\n- **Profit Margin:** 25.31%\n\n## Growth Potential\nStrong innovation pipeline and market position suggest continued growth opportunities.`,
        timestamp: new Date().toISOString()
      };

      setReport(mockReport);
    }, 2000);
  };

  // ... rest of your component JSX remains the same
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
                    className="w-full px-4 py-3 text-white border border-white rounded-lg focus:ring-2 focus:ring-[#2E6F40] focus:border-[#2E6F40] transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && analyzeCompany()}
                  />
                </div>
                <button
                  onClick={analyzeCompany}
                  disabled={loading || !companyName.trim()}
                  className="px-8 py-3 bg-[#2E6F40] text-white rounded-lg hover:bg-[#2E6F40] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 min-w-[120px]"
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {report && (
          <div className="bg-[#212121] rounded-2xl shadow-xl p-8 border border-gray-200">
            {/* Company Header */}
            <div className="border-b border-gray-200 pb-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {report.companyInfo.name} 
                    <span className="text-blue-600 ml-2">({report.companyInfo.symbol})</span>
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                  </div>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <span className="text-green-800 font-medium">Analysis Complete</span>
                </div>
              </div>
            </div>

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-900">Market Cap</h3>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  ${(parseInt(report.financialData.overview.MarketCapitalization) / 1000000000).toFixed(1)}B
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-900">P/E Ratio</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {report.financialData.overview.PERatio || 'N/A'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-purple-900">Profit Margin</h3>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {report.financialData.overview.ProfitMargin || 'N/A'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-orange-900">Revenue</h3>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  ${(parseInt(report.financialData.overview.Revenue) / 1000000000).toFixed(1)}B
                </p>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI Analysis Report</h3>
              </div>
              
              <div className="prose max-w-none">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: report.aiAnalysis
                        .replace(/\n/g, '<br>')
                        .replace(/# (.*?)\n/g, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-4">$1</h3>')
                        .replace(/## (.*?)\n/g, '<h4 class="text-lg font-semibold text-gray-800 mt-4 mb-3">$1</h4>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
                        .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4 mb-2">$1</li>')
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Export as PDF
              </button>
              <button 
                onClick={() => {
                  setReport(null);
                  setCompanyName('');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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