require('dotenv').config();
import alchemystService from '../alchemyst';

class CompanyResearch {

    private service: typeof alchemystService;

    constructor() {
        this.service = alchemystService;
    }

    async runDemoResearch() {
        console.log('🚀 Starting Company Research Demo\n');
        
        // Test connection first
        const connectionTest = await this.service.testConnection();
        if (!connectionTest.success) {
            console.log('❌ Cannot proceed - API connection failed');
            return;
        }

        try {
            // 1. Single Company Research
            console.log('\n' + '='.repeat(60));
            console.log('🏢 SINGLE COMPANY RESEARCH');
            console.log('='.repeat(60));
            
            const companyResult = await this.service.researchCompany('Tesla', 'comprehensive');
            this.printResult('Tesla Comprehensive Analysis', companyResult);

            // 2. SWOT Analysis
            console.log('\n' + '='.repeat(60));
            console.log('📈 SWOT ANALYSIS');
            console.log('='.repeat(60));
            
            const swotResult = await this.service.swotAnalysis('Netflix');
            this.printResult('Netflix SWOT Analysis', swotResult);

            // 3. Industry Analysis
            console.log('\n' + '='.repeat(60));
            console.log('📊 INDUSTRY ANALYSIS');
            console.log('='.repeat(60));
            
            const industryResult = await this.service.analyzeIndustry('Electric Vehicle', 'last 5 years');
            this.printResult('Electric Vehicle Industry Analysis', industryResult);

        } catch (error) {
            console.error('❌ Research failed:', error);
        }
    }

    async researchSpecificCompany(companyName: string, analysisTypes: string[] = ['comprehensive']) {
        console.log(`\n🔍 Researching ${companyName}...`);
        
        const results: any = {};
        
        for (const analysisType of analysisTypes) {
            try {
                console.log(`\n📋 Performing ${analysisType} analysis...`);
                
                let result;
                switch (analysisType) {
                    case 'comprehensive':
                        result = await this.service.researchCompany(companyName, 'comprehensive');
                        break;
                    case 'swot':
                        result = await this.service.swotAnalysis(companyName);
                        break;
                    case 'competitive':
                        result = await this.service.competitiveAnalysis(companyName);
                        break;
                    case 'financial':
                        result = await this.service.financialAnalysis(companyName);
                        break;
                    case 'quick':
                        result = await this.service.researchCompany(companyName, 'quick');
                        break;
                    default:
                        result = await this.service.researchCompany(companyName, 'comprehensive');
                }
                
                results[analysisType] = result;
                this.printResult(`${companyName} - ${analysisType.toUpperCase()}`, result);
                
            } catch (error: any) {
                console.error(`❌ ${analysisType} analysis failed:`, error.message);
                results[analysisType] = { error: error.message };
            }
        }
        
        return results;
    }

    private printResult(title: string, result: any) {
        console.log(`\n📄 ${title}`);
        console.log('-'.repeat(50));
        console.log(result.content);
        console.log(`\n⏰ Generated: ${result.timestamp}`);
        if (result.thinkingSteps && result.thinkingSteps.length > 0) {
            console.log(`🤔 Thinking steps: ${result.thinkingSteps.length}`);
        }
        console.log('');
    }
}

// 🚀 Run the research
async function main() {
    const research = new CompanyResearch();
    
    // Run demo with example companies
    await research.runDemoResearch();
    
    // Or research specific companies
    // await research.researchSpecificCompany('Your Target Company', ['comprehensive', 'swot', 'financial']);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
    const companyName = args[0];
    const analysisTypes = args.slice(1);
    
    const research = new CompanyResearch();
    research.researchSpecificCompany(companyName, analysisTypes);
} else {
    // Run demo if no arguments
    main().catch(console.error);
}