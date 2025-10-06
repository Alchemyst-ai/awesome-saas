import { NextRequest, NextResponse } from 'next/server';
import alchemystService from '../../../lib/alchemyst';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BUILTWITH_API_KEY = '2adabceb-be64-434d-975f-c785a6f5e44f';

// Step 1: Try to get company domain, but don't fail if not found
async function getCompanyDomain(companyName: string): Promise<string | null> {
  try {
    console.log(`🔍 Looking up domain for company: ${companyName}`);
    
    const response = await fetch(
      `https://api.builtwith.com/ctu3/api.json?KEY=${BUILTWITH_API_KEY}&COMPANY=${encodeURIComponent(companyName)}`
    );

    if (!response.ok) {
      console.log(`⚠️ Company lookup API error: ${response.status}, continuing without domain data`);
      return null;
    }

    const data = await response.json();
    
    // Extract domain from response
    if (data.Results && data.Results.length > 0) {
      const domain = data.Results[0].Domain;
      console.log(`✅ Found domain: ${domain} for company: ${companyName}`);
      return domain;
    }
    
    console.log(`⚠️ No domain found for company: ${companyName}, continuing without domain data`);
    return null;
  } catch (error) {
    console.error('⚠️ Company domain lookup error, continuing without domain data:', error);
    return null;
  }
}

// Step 2: Get detailed domain analysis with graceful fallbacks
async function getDomainAnalysis(domain: string | null, companyName: string) {
  // If no domain, return mock data and continue
  if (!domain) {
    console.log(`🔄 No domain available, using mock data for analysis of ${companyName}`);
    return getMockDomainAnalysis(companyName);
  }

  try {
    console.log(`🔧 Analyzing domain: ${domain}`);
    
    const [techData, financialData] = await Promise.allSettled([
      getTechnologyData(domain),
      getFinancialData(domain)
    ]);

    return {
      domain,
      technologies: techData.status === 'fulfilled' ? techData.value.technologies : [],
      hosting: techData.status === 'fulfilled' ? techData.value.hosting : getMockHostingInfo(),
      analytics: techData.status === 'fulfilled' ? techData.value.analytics : getMockAnalytics(),
      advertising: techData.status === 'fulfilled' ? techData.value.advertising : getMockAdvertising(),
      traffic: techData.status === 'fulfilled' ? techData.value.traffic : getMockTraffic(),
      social: techData.status === 'fulfilled' ? techData.value.social : getMockSocial(),
      security: techData.status === 'fulfilled' ? techData.value.security : getMockSecurity(),
      financial: financialData.status === 'fulfilled' ? financialData.value : getMockFinancialData(companyName),
      dataAvailable: techData.status === 'fulfilled' || financialData.status === 'fulfilled'
    };
  } catch (error) {
    console.error('⚠️ Domain analysis error, using mock data:', error);
    return getMockDomainAnalysis(companyName);
  }
}

// Get technology stack data with error handling
async function getTechnologyData(domain: string) {
  try {
    const response = await fetch(
      `https://api.builtwith.com/v22/api.json?KEY=${BUILTWITH_API_KEY}&LOOKUP=${domain}`
    );

    if (!response.ok) {
      throw new Error(`Technology API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      technologies: extractTechnologies(data),
      hosting: extractHostingInfo(data),
      analytics: extractAnalytics(data),
      advertising: extractAdvertising(data),
      traffic: extractTrafficEstimates(data),
      social: extractSocialMedia(data),
      security: extractSecurityInfo(data),
      rawData: data
    };
  } catch (error) {
    console.error('Technology data error, using mock data:', error);
    throw error; // Let the caller handle the fallback
  }
}

// Get financial data for domain with error handling
async function getFinancialData(domain: string) {
  try {
    const response = await fetch(
      `https://api.builtwith.com/financial1/api.json?KEY=${BUILTWITH_API_KEY}&LOOKUP=${domain}`
    );

    if (!response.ok) {
      console.log('Financial API not available, using mock data');
      return getMockFinancialData(domain);
    }

    const data = await response.json();
    
    return {
      revenue: extractRevenue(data),
      employees: extractEmployeeCount(data),
      industry: extractIndustry(data),
      funding: extractFundingData(data),
      rawData: data
    };
  } catch (error) {
    console.error('Financial API error, using mock data:', error);
    return getMockFinancialData(domain);
  }
}

// Extract technologies from BuiltWith response
function extractTechnologies(data: any) {
  if (!data.Groups || !Array.isArray(data.Groups)) return [];
  
  const technologies: any[] = [];
  
  data.Groups.forEach((group: any) => {
    if (group.Categories && Array.isArray(group.Categories)) {
      group.Categories.forEach((category: any) => {
        if (category.Live && Array.isArray(category.Live)) {
          category.Live.forEach((tech: any) => {
            technologies.push({
              name: tech.Name,
              description: tech.Description,
              category: category.Name,
              firstDetected: tech.FirstDetected,
              lastDetected: tech.LastDetected,
              tags: tech.Tags || []
            });
          });
        }
      });
    }
  });
  
  return technologies.slice(0, 25); // Return top 25 technologies
}

// Extract hosting information
function extractHostingInfo(data: any) {
  const hosting = {
    provider: 'Unknown',
    ipAddress: data.Meta?.IP || 'Unknown',
    location: 'Unknown',
    nameservers: [] as string[],
    cdn: 'None'
  };

  // Look for hosting providers
  const hostingTechs = extractTechnologies(data).filter(tech => 
    tech.category?.toLowerCase().includes('hosting') ||
    tech.name?.toLowerCase().includes('hosting') ||
    tech.name?.toLowerCase().includes('aws') ||
    tech.name?.toLowerCase().includes('cloudflare') ||
    tech.name?.toLowerCase().includes('azure')
  );

  if (hostingTechs.length > 0) {
    hosting.provider = hostingTechs[0].name;
  }

  // Look for CDN
  const cdnTechs = extractTechnologies(data).filter(tech => 
    tech.category?.toLowerCase().includes('cdn') ||
    tech.name?.toLowerCase().includes('cloudflare') ||
    tech.name?.toLowerCase().includes('akamai') ||
    tech.name?.toLowerCase().includes('fastly')
  );

  if (cdnTechs.length > 0) {
    hosting.cdn = cdnTechs[0].name;
  }

  return hosting;
}

// Extract analytics tools
function extractAnalytics(data: any) {
  const analyticsTools = extractTechnologies(data).filter(tech => 
    tech.category?.toLowerCase().includes('analytics') ||
    tech.name?.toLowerCase().match(/google analytics|mixpanel|amplitude|hotjar|matomo|adobe analytics/i)
  );

  return {
    tools: analyticsTools,
    hasGoogleAnalytics: analyticsTools.some(tool => 
      tool.name?.toLowerCase().includes('google analytics')
    ),
    hasAdvancedAnalytics: analyticsTools.length > 1,
    toolCount: analyticsTools.length
  };
}

// Extract advertising networks
function extractAdvertising(data: any) {
  const adNetworks = extractTechnologies(data).filter(tech => 
    tech.category?.toLowerCase().includes('advertising') ||
    tech.name?.toLowerCase().match(/google ads|facebook pixel|doubleclick|adroll|bing ads|linkedin insight/i)
  );

  return {
    networks: adNetworks,
    hasGoogleAds: adNetworks.some(network => 
      network.name?.toLowerCase().includes('google ads')
    ),
    hasFacebookPixel: adNetworks.some(network => 
      network.name?.toLowerCase().includes('facebook')
    ),
    networkCount: adNetworks.length
  };
}

// Extract traffic estimates
function extractTrafficEstimates(data: any) {
  const traffic = {
    globalRank: data.Meta?.GlobalRank || 'N/A',
    countryRank: data.Meta?.CountryRank || 'N/A',
    reach: data.Meta?.Reach || 'N/A',
    pageViews: data.Meta?.PageViews || 'N/A',
    estimatedVisits: 'N/A',
    rankDescription: 'N/A'
  };

  // Calculate estimated monthly visits based on rank
  if (traffic.globalRank !== 'N/A') {
    const rank = parseInt(traffic.globalRank);
    if (rank < 100) {
      traffic.estimatedVisits = '50M+ monthly';
      traffic.rankDescription = 'Top 100 Global';
    } else if (rank < 1000) {
      traffic.estimatedVisits = '10M-50M monthly';
      traffic.rankDescription = 'Top 1,000 Global';
    } else if (rank < 10000) {
      traffic.estimatedVisits = '1M-10M monthly';
      traffic.rankDescription = 'Top 10,000 Global';
    } else if (rank < 100000) {
      traffic.estimatedVisits = '100K-1M monthly';
      traffic.rankDescription = 'Top 100,000 Global';
    } else if (rank < 1000000) {
      traffic.estimatedVisits = '10K-100K monthly';
      traffic.rankDescription = 'Top 1M Global';
    } else {
      traffic.estimatedVisits = '<10K monthly';
      traffic.rankDescription = 'Long Tail';
    }
  }

  return traffic;
}

// Extract social media integrations
function extractSocialMedia(data: any) {
  const socialPlatforms = extractTechnologies(data).filter(tech => 
    tech.category?.toLowerCase().includes('social') ||
    tech.name?.toLowerCase().match(/facebook|twitter|linkedin|instagram|youtube|pinterest|tiktok|snapchat/i)
  );

  return {
    platforms: socialPlatforms,
    hasFacebook: socialPlatforms.some(platform => 
      platform.name?.toLowerCase().includes('facebook')
    ),
    hasTwitter: socialPlatforms.some(platform => 
      platform.name?.toLowerCase().includes('twitter')
    ),
    hasLinkedIn: socialPlatforms.some(platform => 
      platform.name?.toLowerCase().includes('linkedin')
    ),
    hasInstagram: socialPlatforms.some(platform => 
      platform.name?.toLowerCase().includes('instagram')
    ),
    platformCount: socialPlatforms.length
  };
}

// Extract security information
function extractSecurityInfo(data: any) {
  const securityTechs = extractTechnologies(data).filter(tech => 
    tech.category?.toLowerCase().includes('security') ||
    tech.name?.toLowerCase().match(/ssl|https|waf|firewall|cloudflare security|recaptcha/i)
  );

  const sslInfo = securityTechs.find(tech => 
    tech.name?.toLowerCase().includes('ssl')
  );

  return {
    technologies: securityTechs,
    hasSSL: !!sslInfo,
    sslProvider: sslInfo?.name || 'None',
    securityScore: securityTechs.length > 3 ? 'High' : securityTechs.length > 1 ? 'Medium' : 'Low'
  };
}

// Extract financial data
function extractRevenue(data: any) {
  // BuiltWith financial API structure may vary
  if (data.Revenue) return data.Revenue;
  if (data.EstimatedRevenue) return data.EstimatedRevenue;
  
  // Fallback based on traffic rank
  const rank = data.Meta?.GlobalRank;
  if (rank && rank !== 'N/A') {
    const rankNum = parseInt(rank);
    if (rankNum < 1000) return '$100M+';
    if (rankNum < 10000) return '$10M-$100M';
    if (rankNum < 100000) return '$1M-$10M';
    return 'Under $1M';
  }
  
  return 'Unknown';
}

function extractEmployeeCount(data: any) {
  if (data.Employees) return data.Employees;
  if (data.EstimatedEmployees) return data.EstimatedEmployees;
  
  // Estimate based on typical company size patterns
  const revenue = extractRevenue(data);
  if (revenue === '$100M+') return '1000+';
  if (revenue === '$10M-$100M') return '100-1000';
  if (revenue === '$1M-$10M') return '10-100';
  return '1-10';
}

function extractIndustry(data: any) {
  if (data.Industry) return data.Industry;
  if (data.Category) return data.Category;
  return 'Technology'; // Default
}

function extractFundingData(data: any) {
  if (data.Funding) return data.Funding;
  if (data.TotalFunding) return data.TotalFunding;
  
  return {
    totalFunding: 'Unknown',
    lastRound: 'Unknown',
    investors: []
  };
}

// Enhanced mock data functions
function getMockFinancialData(companyName: string) {
  // Generate more realistic mock data based on company name
  const mockData = {
    revenue: '$50M-$100M',
    employees: '500-1000',
    industry: 'Technology',
    funding: {
      totalFunding: '$150M',
      lastRound: 'Series C',
      investors: ['Sequoia Capital', 'Accel Partners']
    },
    rawData: null,
    isMock: true
  };

  // Adjust based on well-known companies
  const lowerName = companyName.toLowerCase();
  if (lowerName.includes('tesla') || lowerName === 'tsla') {
    mockData.revenue = '$50B-$100B';
    mockData.employees = '100,000+';
    mockData.industry = 'Automotive & Clean Energy';
  } else if (lowerName.includes('apple') || lowerName === 'aapl') {
    mockData.revenue = '$300B+';
    mockData.employees = '150,000+';
    mockData.industry = 'Consumer Electronics';
  } else if (lowerName.includes('microsoft') || lowerName === 'msft') {
    mockData.revenue = '$200B+';
    mockData.employees = '200,000+';
    mockData.industry = 'Software & Cloud';
  } else if (lowerName.includes('google') || lowerName.includes('alphabet') || lowerName === 'googl') {
    mockData.revenue = '$250B+';
    mockData.employees = '180,000+';
    mockData.industry = 'Internet Services & Advertising';
  } else if (lowerName.includes('amazon') || lowerName === 'amzn') {
    mockData.revenue = '$500B+';
    mockData.employees = '1,500,000+';
    mockData.industry = 'E-commerce & Cloud Computing';
  }

  return mockData;
}

function getMockDomainAnalysis(companyName: string) {
  return {
    domain: companyName.toLowerCase().replace(/\s+/g, '') + '.com',
    technologies: [
      { name: 'React', category: 'JavaScript Frameworks', description: 'Frontend framework' },
      { name: 'Node.js', category: 'Programming Languages', description: 'Server-side runtime' },
      { name: 'AWS', category: 'Hosting', description: 'Cloud infrastructure' },
      { name: 'Google Analytics', category: 'Analytics', description: 'Web analytics service' },
      { name: 'Cloudflare', category: 'CDN', description: 'Content delivery network' }
    ],
    hosting: getMockHostingInfo(),
    analytics: getMockAnalytics(),
    advertising: getMockAdvertising(),
    traffic: getMockTraffic(),
    social: getMockSocial(),
    security: getMockSecurity(),
    financial: getMockFinancialData(companyName),
    dataAvailable: false,
    isMock: true
  };
}

function getMockHostingInfo() {
  return {
    provider: 'AWS',
    ipAddress: 'Unknown',
    location: 'Unknown',
    cdn: 'Cloudflare',
    isMock: true
  };
}

function getMockAnalytics() {
  return {
    tools: [{ name: 'Google Analytics', category: 'Analytics' }],
    hasGoogleAnalytics: true,
    hasAdvancedAnalytics: false,
    toolCount: 1,
    isMock: true
  };
}

function getMockAdvertising() {
  return {
    networks: [{ name: 'Google Ads', category: 'Advertising' }],
    hasGoogleAds: true,
    hasFacebookPixel: false,
    networkCount: 1,
    isMock: true
  };
}

function getMockTraffic() {
  return {
    globalRank: 'N/A',
    estimatedVisits: 'Unknown',
    rankDescription: 'Data not available',
    isMock: true
  };
}

function getMockSocial() {
  return {
    platforms: [
      { name: 'LinkedIn', category: 'Social' },
      { name: 'Twitter', category: 'Social' }
    ],
    hasFacebook: false,
    hasTwitter: true,
    hasLinkedIn: true,
    hasInstagram: false,
    platformCount: 2,
    isMock: true
  };
}

function getMockSecurity() {
  return {
    hasSSL: true,
    sslProvider: 'Unknown',
    securityScore: 'Medium',
    technologies: [
      { name: 'SSL Certificate', category: 'Security' }
    ],
    isMock: true
  };
}

// Alpha Vantage integration with graceful failure
async function getAlphaVantageData(companyName: string) {
  try {
    const symbol = await searchSymbol(companyName);
    if (!symbol) {
      console.log(`⚠️ No symbol found for ${companyName}, continuing without financial data`);
      return null;
    }

    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      console.log(`⚠️ Alpha Vantage API error for ${companyName}, continuing without financial data`);
      return null;
    }
    
    const data = await response.json();
    
    // Check if we got valid data (Alpha Vantage returns error messages in successful responses)
    if (data.Note || data.Information || data.Error) {
      console.log(`⚠️ Alpha Vantage rate limit or error for ${companyName}, continuing without financial data`);
      return null;
    }
    
    console.log(`✅ Alpha Vantage data received for: ${companyName}`);
    return data;
  } catch (error) {
    console.error(`⚠️ Alpha Vantage error for ${companyName}, continuing without financial data:`, error);
    return null;
  }
}

async function searchSymbol(companyName: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(companyName)}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      return null;
    }
    
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

// Main API endpoint - NEVER FAILS due to missing data
export async function POST(request: NextRequest) {
  let companyName = 'Unknown Company';
  
  try {
    const requestBody = await request.json();
    companyName = requestBody.companyName;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting comprehensive analysis for: ${companyName}`);

    // Step 1: Try to get company domain (but continue even if it fails)
    const domain = await getCompanyDomain(companyName);
    
    // Step 2: Get comprehensive data (will use mock data if domain is null)
    const [financialData, domainAnalysis] = await Promise.all([
      getAlphaVantageData(companyName), // This can also return null
      getDomainAnalysis(domain, companyName) // This always returns data (real or mock)
    ]);

    // Step 3: Generate AI analysis with whatever data we have
    const analysisResult = await alchemystService.analyzeCompanyComprehensive(
      companyName,
      {
        financialData: financialData || {}, // Handle null financial data
        domainAnalysis,
        companyDomain: domain || companyName.toLowerCase().replace(/\s+/g, '') + '.com'
      }
    );

    const response = {
      companyInfo: {
        name: financialData?.Name || companyName,
        symbol: financialData?.Symbol || 'N/A',
        domain: domain || companyName.toLowerCase().replace(/\s+/g, '') + '.com',
        exchange: financialData?.Exchange || 'N/A',
        currency: financialData?.Currency || 'USD',
        sector: financialData?.Sector || domainAnalysis.financial.industry,
        industry: financialData?.Industry || domainAnalysis.financial.industry,
        country: financialData?.Country || 'N/A'
      },
      financialData: {
        overview: financialData ? {
          MarketCapitalization: financialData.MarketCapitalization,
          PERatio: financialData.PERatio,
          ProfitMargin: financialData.ProfitMargin,
          RevenueTTM: financialData.RevenueTTM,
          EBITDA: financialData.EBITDA,
          EPS: financialData.EPS,
          DividendYield: financialData.DividendYield,
          '52WeekHigh': financialData['52WeekHigh'],
          '52WeekLow': financialData['52WeekLow'],
          Beta: financialData.Beta,
          QuarterlyEarningsGrowthYOY: financialData.QuarterlyEarningsGrowthYOY,
          QuarterlyRevenueGrowthYOY: financialData.QuarterlyRevenueGrowthYOY
        } : {},
        builtWithFinancial: domainAnalysis.financial,
        dataAvailable: !!financialData
      },
      technologyAnalysis: {
        domain: domainAnalysis.domain,
        hosting: domainAnalysis.hosting,
        analytics: domainAnalysis.analytics,
        advertising: domainAnalysis.advertising,
        traffic: domainAnalysis.traffic,
        social: domainAnalysis.social,
        security: domainAnalysis.security,
        topTechnologies: domainAnalysis.technologies.slice(0, 10),
        dataAvailable: domainAnalysis.dataAvailable
      },
      aiAnalysis: analysisResult.content,
      timestamp: new Date().toISOString(),
      dataSources: {
        alphaVantage: !!financialData,
        builtWith: domainAnalysis.dataAvailable,
        aiAnalysis: true
      }
    };

    console.log(`✅ Analysis completed successfully for: ${companyName}`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Comprehensive analysis error:', error);
    
    // Even if everything fails, return a basic response with AI analysis
    try {
      const fallbackAnalysis = await alchemystService.analyzeCompanyComprehensive(
        companyName,
        {
          financialData: {},
          domainAnalysis: getMockDomainAnalysis(companyName),
          companyDomain: companyName.toLowerCase().replace(/\s+/g, '') + '.com'
        }
      );

      return NextResponse.json({
        companyInfo: {
          name: companyName,
          symbol: 'N/A',
          domain: companyName.toLowerCase().replace(/\s+/g, '') + '.com',
          exchange: 'N/A',
          currency: 'USD',
          sector: 'Technology',
          industry: 'Various',
          country: 'N/A'
        },
        financialData: {
          overview: {},
          builtWithFinancial: getMockFinancialData(companyName),
          dataAvailable: false
        },
        technologyAnalysis: getMockDomainAnalysis(companyName),
        aiAnalysis: fallbackAnalysis.content,
        timestamp: new Date().toISOString(),
        dataSources: {
          alphaVantage: false,
          builtWith: false,
          aiAnalysis: true
        },
        note: 'Using fallback data due to API limitations'
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { 
          error: 'Analysis service temporarily unavailable. Please try again later.',
          companyName: companyName || 'Unknown Company'
        },
        { status: 503 }
      );
    }
  }
}