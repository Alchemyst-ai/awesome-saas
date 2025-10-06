'use client';
import { useState } from 'react';

// Define types for our enhanced data
interface CompanyInfo {
  name: string;
  symbol: string;
  domain: string;
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
  builtWithFinancial: {
    revenue: string;
    employees: string;
    funding: {
      totalFunding: string;
      lastRound: string;
      investors: string[];
    };
  };
  currentQuote?: {
    '05. price': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface TechnologyAnalysis {
  domain: string;
  hosting: {
    provider: string;
    ipAddress: string;
    cdn: string;
  };
  analytics: {
    tools: any[];
    hasGoogleAnalytics: boolean;
    hasAdvancedAnalytics: boolean;
    toolCount: number;
  };
  advertising: {
    networks: any[];
    hasGoogleAds: boolean;
    hasFacebookPixel: boolean; // ADDED THIS
    networkCount: number;
  };
  traffic: {
    globalRank: string;
    estimatedVisits: string;
    rankDescription: string;
  };
  social: {
    platforms: any[];
    hasFacebook: boolean;
    hasTwitter: boolean;
    hasLinkedIn: boolean;
    hasInstagram: boolean;
    platformCount: number;
  };
  security: {
    hasSSL: boolean;
    sslProvider: string;
    securityScore: string;
    technologies: any[];
  };
  topTechnologies: Array<{
    name: string;
    category: string;
    description: string;
  }>;
}

interface Report {
  companyInfo: CompanyInfo;
  financialData: FinancialData;
  technologyAnalysis: TechnologyAnalysis;
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
    if (!num || num === 'N/A') return 'N/A';
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
    if (!value || value === 'N/A') return 'N/A';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return `${(num * 100).toFixed(2)}%`;
  };

  const getSecurityColor = (score: string) => {
    switch (score?.toLowerCase()) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrafficColor = (rank: string) => {
    if (rank === 'N/A') return 'text-gray-400';
    const rankNum = parseInt(rank);
    if (rankNum < 1000) return 'text-green-400';
    if (rankNum < 10000) return 'text-blue-400';
    if (rankNum < 100000) return 'text-yellow-400';
    return 'text-orange-400';
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
            Get comprehensive AI-powered analysis with technology stack, web traffic, and financial insights
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {report.companyInfo.domain}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-lg border border-emerald-500 shadow-lg">
                  <span className="text-white font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Deep Analysis Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Technology Stack Overview */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Technology Stack & Digital Presence
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Web Traffic */}
                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 p-6 rounded-xl border border-purple-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-purple-300">Web Traffic</h3>
                  </div>
                  <p className={`text-2xl font-bold ${getTrafficColor(report.technologyAnalysis.traffic.globalRank)} mb-1`}>
                    {report.technologyAnalysis.traffic.estimatedVisits}
                  </p>
                  <p className="text-sm text-purple-200">
                    Global Rank: {report.technologyAnalysis.traffic.globalRank}
                  </p>
                </div>

                {/* Hosting Provider */}
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-6 rounded-xl border border-blue-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-blue-300">Hosting</h3>
                  </div>
                  <p className="text-xl font-bold text-white mb-1">
                    {report.technologyAnalysis.hosting.provider}
                  </p>
                  <p className="text-sm text-blue-200">
                    CDN: {report.technologyAnalysis.hosting.cdn}
                  </p>
                </div>

                {/* Analytics Tools */}
                <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 p-6 rounded-xl border border-green-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-green-300">Analytics</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {report.technologyAnalysis.analytics.toolCount} tools
                  </p>
                  <p className="text-sm text-green-200">
                    {report.technologyAnalysis.analytics.hasGoogleAnalytics ? 'Google Analytics ✓' : 'No Google Analytics'}
                  </p>
                </div>

                {/* Security Score */}
                <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 p-6 rounded-xl border border-orange-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-orange-300">Security</h3>
                  </div>
                  <p className={`text-2xl font-bold ${getSecurityColor(report.technologyAnalysis.security.securityScore)} mb-1`}>
                    {report.technologyAnalysis.security.securityScore}
                  </p>
                  <p className="text-sm text-orange-200">
                    {report.technologyAnalysis.security.hasSSL ? 'SSL Enabled ✓' : 'No SSL'}
                  </p>
                </div>
              </div>

              {/* Technology Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Technologies */}
                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Top Technologies
                  </h4>
                  <div className="space-y-2">
                    {report.technologyAnalysis.topTechnologies.slice(0, 8).map((tech, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
                        <span className="text-gray-300 text-sm">{tech.name}</span>
                        <span className="text-gray-500 text-xs bg-gray-600 px-2 py-1 rounded">
                          {tech.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Digital Marketing */}
                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                    Digital Marketing
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Advertising Networks</span>
                      <span className="text-white font-semibold">{report.technologyAnalysis.advertising.networkCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Social Platforms</span>
                      <span className="text-white font-semibold">{report.technologyAnalysis.social.platformCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Google Ads</span>
                      <span className={report.technologyAnalysis.advertising.hasGoogleAds ? "text-green-400" : "text-red-400"}>
                        {report.technologyAnalysis.advertising.hasGoogleAds ? "✓ Enabled" : "✗ Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Facebook Pixel</span>
                      <span className={report.technologyAnalysis.advertising.hasFacebookPixel ? "text-green-400" : "text-red-400"}>
                        {report.technologyAnalysis.advertising.hasFacebookPixel ? "✓ Enabled" : "✗ Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Metrics Grid */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Financial Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Market Cap */}
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-6 rounded-xl border border-blue-700 shadow-lg">
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

                {/* Estimated Revenue */}
                <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 p-6 rounded-xl border border-green-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-green-300">Est. Revenue</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {report.financialData.builtWithFinancial.revenue}
                  </p>
                  <p className="text-sm text-green-200">Annual revenue estimate</p>
                </div>

                {/* Employees */}
                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 p-6 rounded-xl border border-purple-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-purple-300">Employees</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {report.financialData.builtWithFinancial.employees}
                  </p>
                  <p className="text-sm text-purple-200">Team size estimate</p>
                </div>

                {/* Total Funding */}
                <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 p-6 rounded-xl border border-orange-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-orange-300">Total Funding</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {report.financialData.builtWithFinancial.funding.totalFunding}
                  </p>
                  <p className="text-sm text-orange-200">Investment raised</p>
                </div>
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
                  <h3 className="text-2xl font-bold text-white">Comprehensive AI Analysis</h3>
                  <p className="text-gray-400">Powered by Alchemyst AI & BuiltWith Data</p>
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
              Powered by Alchemyst AI & BuiltWith • Technology stack analysis with financial insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}