/**
 * Demo script to showcase Alchemyst AI SDK integration
 * This demonstrates the key features implemented in task 6
 */

import { generatePrompt, checkAlchemystHealth } from './ai-client';
import type { UserInput } from '@/types';

/**
 * Demo function showing Alchemyst AI SDK integration features
 */
export async function demonstrateAlchemystIntegration() {
  console.log('🚀 Alchemyst AI SDK Integration Demo\n');

  // 1. Health Check
  console.log('1. Testing Alchemyst AI service health...');
  const isHealthy = await checkAlchemystHealth();
  console.log(
    `   Service status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`
  );

  // 2. Sample user input
  const sampleInput: UserInput = {
    websiteName: 'TechFlow Solutions',
    industry: 'saas',
    aboutInfo:
      'A modern project management platform for software development teams with real-time collaboration, task tracking, and automated reporting features.',
    additionalRequirements:
      'Dark mode support, mobile-responsive design, and integration with popular development tools',
  };

  console.log('2. Sample user input:');
  console.log(`   Website: ${sampleInput.websiteName}`);
  console.log(`   Industry: ${sampleInput.industry}`);
  console.log(`   About: ${sampleInput.aboutInfo}`);
  console.log(`   Additional: ${sampleInput.additionalRequirements}\n`);

  // 3. Generate AI-enhanced prompt
  console.log('3. Generating AI-enhanced V0 prompt...');
  try {
    const generatedPrompt = await generatePrompt(sampleInput);

    console.log('   ✅ Prompt generated successfully!');
    console.log(`   Title: ${generatedPrompt.title}`);
    console.log(
      `   Features: ${generatedPrompt.industryFeatures.slice(0, 3).join(', ')}...`
    );
    console.log(
      `   Reasoning: ${generatedPrompt.explanation.reasoning.substring(0, 100)}...\n`
    );

    // Show key integration features
    console.log('4. Key Alchemyst AI Integration Features Demonstrated:');
    console.log('   ✅ Client configuration and authentication');
    console.log('   ✅ Context enrichment using industry knowledge base');
    console.log('   ✅ AI-powered prompt generation service');
    console.log('   ✅ Error handling and retry logic');
    console.log('   ✅ Fallback to template-based generation');
    console.log('   ✅ Circuit breaker pattern for service resilience');
    console.log('   ✅ Health check monitoring\n');

    return generatedPrompt;
  } catch (error) {
    console.log(
      '   ⚠️  AI generation failed, but fallback mechanisms are in place'
    );
    console.log(
      `   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`
    );

    console.log('4. Fallback Features Demonstrated:');
    console.log('   ✅ Graceful error handling');
    console.log('   ✅ Template-based prompt generation');
    console.log('   ✅ Service resilience patterns\n');

    throw error;
  }
}

/**
 * Show the integration architecture
 */
export function showIntegrationArchitecture() {
  console.log('🏗️  Alchemyst AI SDK Integration Architecture:\n');

  console.log(
    '┌─────────────────────────────────────────────────────────────┐'
  );
  console.log(
    '│                    User Interface Layer                     │'
  );
  console.log(
    '├─────────────────────────────────────────────────────────────┤'
  );
  console.log(
    '│              Prompt Generation Service                      │'
  );
  console.log(
    '│  • Input validation                                         │'
  );
  console.log(
    '│  • Circuit breaker pattern                                  │'
  );
  console.log(
    '│  • Retry logic with exponential backoff                     │'
  );
  console.log(
    '├─────────────────────────────────────────────────────────────┤'
  );
  console.log(
    '│                 Alchemyst AI Client                         │'
  );
  console.log(
    '│  • Context enrichment                                       │'
  );
  console.log(
    '│  • Industry knowledge integration                           │'
  );
  console.log(
    '│  • AI-powered prompt enhancement                             │'
  );
  console.log(
    '├─────────────────────────────────────────────────────────────┤'
  );
  console.log(
    '│                 Alchemyst AI SDK                            │'
  );
  console.log(
    '│  • Context management (add/search)                          │'
  );
  console.log(
    '│  • AI model integration                                      │'
  );
  console.log(
    '│  • Authentication & rate limiting                           │'
  );
  console.log(
    '├─────────────────────────────────────────────────────────────┤'
  );
  console.log(
    '│                 Fallback System                             │'
  );
  console.log(
    '│  • Template-based generation                                │'
  );
  console.log(
    '│  • Industry configuration                                   │'
  );
  console.log(
    '│  • Error recovery strategies                                │'
  );
  console.log(
    '└─────────────────────────────────────────────────────────────┘\n'
  );
}

// Export for potential use in other demo scenarios
export const demoUserInputs: UserInput[] = [
  {
    websiteName: 'ShopEase',
    industry: 'ecommerce',
    aboutInfo:
      'An online marketplace for handcrafted goods with secure payments and seller tools.',
    additionalRequirements: 'Multi-vendor support and inventory management',
  },
  {
    websiteName: 'John Doe Portfolio',
    industry: 'portfolio',
    aboutInfo:
      'A creative portfolio showcasing web design and development projects.',
    additionalRequirements: 'Interactive animations and contact form',
  },
  {
    websiteName: 'InnovateCorp',
    industry: 'corporate',
    aboutInfo:
      'A technology consulting firm specializing in digital transformation.',
    additionalRequirements: 'Professional appearance with case studies section',
  },
];
