const axios = require('axios');

interface AlchemystOptions {
    persona?: string;
    chatId?: string;
    scope?: string;
    tools?: any[];
    maxTokens?: number;
    temperature?: number;
}

interface ResearchRequest {
    company?: string;
    topic?: string;
    type?: string;
    researchType?: string;
    timeframe?: string;
    competitors?: string[];
}

interface AnalysisResult {
    content: string;
    thinkingSteps: string[];
    timestamp: Date;
}

interface BatchResult {
    total: number;
    successful: number;
    failed: number;
    results: any[];
}

class AlchemystService {
    public baseURL: string;
    public apiKey: string | undefined;
    public defaultTimeout: number;

    constructor() {
        this.baseURL = process.env.ALCHEMYST_API_URL || 'https://platform-backend.getalchemystai.com/api/v1';
        this.apiKey = process.env.ALCHEMYST_API_KEY;
        this.defaultTimeout = 300000; // 30 seconds

        if (!this.apiKey) {
            console.warn('⚠️  Alchemyst API key not found. Please check your .env file.');
        }
    }

    async generateAnalysis(prompt: string, options: AlchemystOptions = {}, retryCount: number = 0): Promise<AnalysisResult> {
        const MAX_RETRIES = 2;
        const RETRY_DELAY = 3000;

        try {
            const requestData: any = {
                chat_history: [
                    {
                        content: prompt,
                        role: "user"
                    }
                ],
                persona: options.persona || "maya"
            };

            if (options.chatId) requestData.chatId = options.chatId;
            if (options.scope) requestData.scope = options.scope;
            if (options.tools) requestData.tools = options.tools;

            console.log(`🔍 Sending request to Alchemyst API (attempt ${retryCount + 1})...`);

            const response = await axios.post(`${this.baseURL}/chat/generate/stream`, requestData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 120000,
                responseType: 'stream'
            });

            let finalContent = '';
            let thinkingSteps: string[] = [];

            return new Promise((resolve, reject) => {
                let buffer = '';
                let resolved = false;

                response.data.on('data', (chunk: Buffer) => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.type === 'thinking_update') {
                                    thinkingSteps.push(parsed.content);
                                } else if (parsed.type === 'final_response') {
                                    finalContent = parsed.content;
                                }
                            } catch (e) {
                                // Ignore JSON parse errors
                            }
                        }
                    }
                });

                response.data.on('end', () => {
                    if (resolved) return;
                    resolved = true;

                    if (!finalContent) {
                        reject(new Error('No response received from AI API'));
                        return;
                    }

                    const result: AnalysisResult = {
                        content: finalContent,
                        thinkingSteps: thinkingSteps,
                        timestamp: new Date()
                    };

                    console.log('✅ Analysis completed successfully');
                    resolve(result);
                });

                response.data.on('error', (error: Error) => {
                    if (resolved) return;
                    resolved = true;

                    if ((error.message.includes('ECONNRESET') || error.message.includes('timeout')) && retryCount < MAX_RETRIES) {
                        console.log(`🔄 Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
                        setTimeout(() => {
                            this.generateAnalysis(prompt, options, retryCount + 1)
                                .then(resolve)
                                .catch(reject);
                        }, RETRY_DELAY);
                    } else {
                        reject(error);
                    }
                });

                // Timeout handling
                setTimeout(() => {
                    if (resolved) return;
                    resolved = true;
                    
                    if (retryCount < MAX_RETRIES) {
                        console.log(`🔄 Retrying after timeout (${retryCount + 1}/${MAX_RETRIES})...`);
                        setTimeout(() => {
                            this.generateAnalysis(prompt, options, retryCount + 1)
                                .then(resolve)
                                .catch(reject);
                        }, RETRY_DELAY);
                    } else {
                        reject(new Error('Request timeout after all retries'));
                    }
                }, 120000);
            });

        } catch (error: any) {
            if (retryCount < MAX_RETRIES && (error.code === 'ECONNRESET' || error.message.includes('timeout'))) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return this.generateAnalysis(prompt, options, retryCount + 1);
            }
            throw error;
        }
    }

    async researchCompany(companyName: string, researchType: string = 'comprehensive'): Promise<AnalysisResult> {
        console.log(`\n🏢 Starting research on: ${companyName}`);
        
        const prompt = this.buildCompanyResearchPrompt(companyName, researchType);
        
        return await this.generateAnalysis(prompt, {
            maxTokens: 4000,
            temperature: 0.2
        });
    }

    async analyzeIndustry(industry: string, timeframe: string = 'last 3 years'): Promise<AnalysisResult> {
        console.log(`\n📊 Analyzing industry: ${industry}`);
        
        const prompt = `
Conduct a comprehensive analysis of the ${industry} industry focusing on trends from ${timeframe}.

Please provide:

INDUSTRY OVERVIEW:
- Market size and growth rate
- Key market segments
- Major geographical markets

KEY TRENDS (${timeframe}):
- Technological advancements
- Consumer behavior changes
- Regulatory developments
- Sustainability initiatives

COMPETITIVE LANDSCAPE:
- Major players and market share
- New entrants and disruptors
- Competitive strategies

FUTURE OUTLOOK:
- Growth opportunities
- Potential challenges and risks
- Emerging technologies
- Market predictions (next 3-5 years)

INVESTMENT CONSIDERATIONS:
- High-growth segments
- Regulatory impacts
- Technological adoption rates

Please provide data-driven insights with specific examples where available.
`;

        return await this.generateAnalysis(prompt, {
            maxTokens: 4500,
            temperature: 0.3
        });
    }

    async competitiveAnalysis(companyName: string, competitors: string[] = []): Promise<AnalysisResult> {
        console.log(`\n⚔️  Competitive analysis for: ${companyName}`);
        
        const prompt = `
Perform a detailed competitive analysis for ${companyName}.

${competitors.length > 0 ? `Main competitors to compare: ${competitors.join(', ')}` : 'Identify and analyze main competitors'}

Analysis Framework:

MARKET POSITION:
- Market share comparison
- Revenue and growth rates
- Geographic presence

PRODUCT/SERVICE COMPARISON:
- Feature comparison
- Pricing strategies
- Unique value propositions

STRENGTHS & WEAKNESSES:
- ${companyName}'s competitive advantages
- Competitor strengths
- Areas for improvement

DIFFERENTIATION:
- Key differentiators
- Brand positioning
- Customer perception

STRATEGIC RECOMMENDATIONS:
- Opportunities to gain market share
- Potential threats to address
- Strategic moves to consider

Please provide a structured comparison table or clear sections for easy comparison.
`;

        return await this.generateAnalysis(prompt, {
            maxTokens: 5000,
            temperature: 0.2
        });
    }

    async swotAnalysis(companyName: string): Promise<AnalysisResult> {
        console.log(`\n📈 SWOT Analysis for: ${companyName}`);
        
        const prompt = `
Conduct a comprehensive SWOT analysis for ${companyName}.

Please structure your analysis as follows:

STRENGTHS (Internal):
- Core competencies and advantages
- Strong brand recognition
- Proprietary technology/IP
- Financial resources
- Operational efficiencies

WEAKNESSES (Internal):
- Operational limitations
- Financial constraints
- Skill gaps
- Technology debt
- Market perception issues

OPPORTUNITIES (External):
- Market trends to leverage
- Technological advancements
- Regulatory changes
- Partnership opportunities
- New market segments

THREATS (External):
- Competitive pressures
- Economic factors
- Regulatory risks
- Technological disruption
- Market saturation

For each category, provide 3-5 specific, actionable points with brief explanations of their significance and potential impact.
`;

        return await this.generateAnalysis(prompt, {
            maxTokens: 3500,
            temperature: 0.1
        });
    }

    async financialAnalysis(companyName: string, timeframe: string = 'last 5 years'): Promise<AnalysisResult> {
        console.log(`\n💰 Financial Analysis for: ${companyName}`);
        
        const prompt = `
Provide a comprehensive financial analysis for ${companyName} covering ${timeframe}.

Analysis should include:

FINANCIAL PERFORMANCE:
- Revenue trends and growth rates
- Profitability metrics (margins, net income)
- Key financial ratios
- Cash flow analysis

INVESTMENT METRICS:
- Return on investment ratios
- Stock performance (if public)
- Market capitalization
- Dividend history (if applicable)

BALANCE SHEET HEALTH:
- Asset composition
- Debt levels and structure
- Liquidity ratios
- Working capital management

INDUSTRY COMPARISON:
- Performance vs. industry peers
- Valuation multiples comparison
- Growth rate comparison

FUTURE OUTLOOK:
- Revenue projections
- Investment requirements
- Potential financial risks
- Growth opportunities

Please focus on trends, comparisons, and actionable insights rather than just presenting numbers.
`;

        return await this.generateAnalysis(prompt, {
            maxTokens: 4000,
            temperature: 0.2
        });
    }

    async multiCompanyComparison(companies: string[], focusAreas: string[] = []): Promise<AnalysisResult> {
        console.log(`\n🔍 Comparing multiple companies: ${companies.join(', ')}`);
        
        const prompt = `
Compare the following companies: ${companies.join(', ')}

${focusAreas.length > 0 ? `Focus areas: ${focusAreas.join(', ')}` : 'Comprehensive comparison across all business aspects'}

Comparison Framework:

BUSINESS OVERVIEW:
- Company size and scale
- Core business models
- Geographic footprint
- Market positioning

FINANCIAL COMPARISON:
- Revenue and growth rates
- Profitability metrics
- Investment returns
- Financial stability

PRODUCT/SERVICE ANALYSIS:
- Key offerings comparison
- Innovation track record
- Quality and features
- Customer satisfaction

COMPETITIVE ADVANTAGES:
- Unique strengths
- Barriers to entry
- Intellectual property
- Brand value

STRATEGIC OUTLOOK:
- Growth strategies
- Market opportunities
- Potential risks
- Future prospects

Please provide a clear, structured comparison that highlights key differences, competitive positioning, and strategic implications.
`;

        return await this.generateAnalysis(prompt, {
            maxTokens: 6000,
            temperature: 0.2
        });
    }

    buildCompanyResearchPrompt(companyName: string, researchType: string): string {
        const basePrompt = `Provide a comprehensive analysis of ${companyName}`;
        
        const researchTemplates: { [key: string]: string } = {
            'comprehensive': `
${basePrompt} covering all major business aspects.

Please include:

EXECUTIVE SUMMARY:
- Brief company overview
- Key findings and insights

COMPANY BACKGROUND:
- History and founding story
- Mission, vision, and values
- Leadership team
- Organizational structure

BUSINESS MODEL:
- Revenue streams
- Customer segments
- Value proposition
- Key partnerships

MARKET POSITION:
- Industry overview
- Market share
- Competitive landscape
- Growth trajectory

FINANCIAL PERFORMANCE:
- Recent financial results
- Key financial metrics
- Investment highlights
- Financial outlook

STRATEGIC ANALYSIS:
- SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
- Competitive advantages
- Strategic initiatives

FUTURE OUTLOOK:
- Growth opportunities
- Potential challenges
- Strategic recommendations

Please provide detailed, evidence-based analysis with specific examples and data where available.
`,

            'quick': `
${basePrompt} - provide a concise overview focusing on:

- Core business and main products
- Key competitors
- Recent performance highlights
- Main strengths and challenges
- Brief future outlook

Keep it under 500 words with bullet points for key information.
`,

            'deep-dive': `
${basePrompt} - conduct an in-depth strategic analysis.

Include detailed sections on:

1. HISTORICAL CONTEXT AND EVOLUTION
2. BUSINESS MODEL DECONSTRUCTION
3. COMPETITIVE POSITIONING ANALYSIS
4. FINANCIAL DEEP DIVE
5. OPERATIONAL EXCELLENCE
6. TECHNOLOGICAL CAPABILITIES
7. MARKET EXPANSION POTENTIAL
8. RISK ASSESSMENT MATRIX
9. STRATEGIC RECOMMENDATIONS
10. LONG-TERM VIABILITY ASSESSMENT

Provide thorough analysis with data points, comparative metrics, and actionable insights.
`
        };

        return researchTemplates[researchType] || researchTemplates['comprehensive'];
    }

    async batchResearch(researchRequests: ResearchRequest[]): Promise<BatchResult> {
        console.log(`\n📚 Processing batch of ${researchRequests.length} research tasks...`);
        
        const results = [];
        
        for (let i = 0; i < researchRequests.length; i++) {
            const request = researchRequests[i];
            console.log(`\n${i + 1}/${researchRequests.length}: Researching ${request.company || request.topic}`);
            
            try {
                let result: AnalysisResult;
                if (request.type === 'industry') {
                    result = await this.analyzeIndustry(request.topic!, request.timeframe);
                } else if (request.type === 'swot') {
                    result = await this.swotAnalysis(request.company!);
                } else if (request.type === 'competitive') {
                    result = await this.competitiveAnalysis(request.company!, request.competitors);
                } else {
                    result = await this.researchCompany(request.company!, request.researchType);
                }
                
                results.push({
                    request: request,
                    success: true,
                    result: result,
                    timestamp: new Date()
                });
                
                // Add delay between requests to avoid rate limiting
                if (i < researchRequests.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
            } catch (error: any) {
                console.error(`❌ Failed to research: ${request.company || request.topic}`, error.message);
                results.push({
                    request: request,
                    success: false,
                    error: error.message,
                    timestamp: new Date()
                });
            }
        }
        
        return {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results: results
        };
    }

    async testConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
        console.log('🔌 Testing connection to Alchemyst API...');
        
        try {
            const testPrompt = "Please respond with 'API connection successful' and nothing else.";
            const result = await this.generateAnalysis(testPrompt, { maxTokens: 50 });
            
            console.log('✅ Connection test passed:', result.content);
            return { success: true, message: result.content };
            
        } catch (error: any) {
            console.error('❌ Connection test failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Add this comprehensive analysis method
    async analyzeCompanyComprehensive(
      companyName: string, 
      data: any
    ): Promise<AnalysisResult> {
      console.log(`🔍 Starting comprehensive analysis for: ${companyName}`);
      
      const prompt = `
    Perform an EXTREMELY DETAILED comprehensive analysis for ${companyName} covering ALL business aspects.

    COMPANY IDENTITY:
    - Company: ${companyName}
    - Domain: ${data.companyDomain}
    - Primary Industry: ${data.financialData?.Sector || data.domainAnalysis?.financial?.industry}

    TECHNOLOGY STACK ANALYSIS:
    ${data.domainAnalysis ? `
    Web Technologies: ${data.domainAnalysis.topTechnologies?.map((tech: any) => tech.name).join(', ') || 'N/A'}
    Hosting Provider: ${data.domainAnalysis.hosting?.provider || 'N/A'}
    CDN: ${data.domainAnalysis.hosting?.cdn || 'None'}
    Analytics Tools: ${data.domainAnalysis.analytics?.tools?.length || 0} tools installed
    Advertising Networks: ${data.domainAnalysis.advertising?.networks?.length || 0} networks detected
    Social Media: ${data.domainAnalysis.social?.platforms?.map((p: any) => p.name).join(', ') || 'N/A'}
    Security Score: ${data.domainAnalysis.security?.securityScore || 'N/A'}
    ` : 'Technology data not available'}

    DIGITAL PRESENCE & TRAFFIC:
    ${data.domainAnalysis?.traffic ? `
    Global Rank: ${data.domainAnalysis.traffic.globalRank}
    Estimated Monthly Visits: ${data.domainAnalysis.traffic.estimatedVisits}
    Rank Description: ${data.domainAnalysis.traffic.rankDescription}
    ` : 'Traffic data not available'}

    FINANCIAL OVERVIEW:
    ${data.financialData ? `
    Market Cap: ${data.financialData.MarketCapitalization || 'N/A'}
    P/E Ratio: ${data.financialData.PERatio || 'N/A'}
    Revenue (TTM): ${data.financialData.RevenueTTM || 'N/A'}
    Profit Margin: ${data.financialData.ProfitMargin || 'N/A'}
    EPS: ${data.financialData.EPS || 'N/A'}
    ` : 'Financial data not available'}

    ESTIMATED BUSINESS METRICS:
    ${data.domainAnalysis?.financial ? `
    Estimated Revenue: ${data.domainAnalysis.financial.revenue}
    Employee Count: ${data.domainAnalysis.financial.employees}
    Total Funding: ${data.domainAnalysis.financial.funding?.totalFunding || 'N/A'}
    ` : 'Business metrics not available'}

    Please provide a comprehensive report covering:

    1. **TECHNOLOGY ASSESSMENT**
      - Technology stack sophistication
      - Infrastructure maturity
      - Digital marketing capabilities
      - Security posture

    2. **DIGITAL FOOTPRINT ANALYSIS**
      - Web traffic and engagement
      - Market reach and visibility
      - Social media presence
      - Competitive digital positioning

    3. **FINANCIAL HEALTH**
      - Revenue and profitability
      - Market valuation
      - Growth potential
      - Investment attractiveness

    4. **BUSINESS INTELLIGENCE**
      - Company maturity stage
      - Market position
      - Competitive advantages
      - Risk factors

    5. **STRATEGIC RECOMMENDATIONS**
      - Growth opportunities
      - Technology improvements
      - Market expansion potential
      - Investment considerations

    Provide specific, data-driven insights with actionable recommendations. Rate the company's overall digital maturity and investment potential.

    Format with clear sections, bullet points, and emphasize key findings.
    `;

      return await this.generateAnalysis(prompt, {
        maxTokens: 5000,
        temperature: 0.2
      });
    }
}

// Create and export service instance
const alchemystService = new AlchemystService();
export default alchemystService;