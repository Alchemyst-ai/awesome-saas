import { AlchemystAI } from '@alchemystai/sdk';

interface BusinessInfo {
  companyName: string;
  contactEmail: string;
  website: string;
  address: string;
  dataTypes: string[];
  thirdPartyServices: string[];
  regions: string[];
  businessType: string;
}

// Initialize Alchemyst AI client
const alchemyst = new AlchemystAI({
  apiKey: process.env.ALCHEMYST_API_KEY || process.env.NEXT_PUBLIC_ALCHEMYST_API_KEY,
});

export async function generatePrivacyPolicy(businessInfo: BusinessInfo): Promise<string> {
  const prompt = createPrivacyPolicyPrompt(businessInfo);
  
  try {
    const response = await alchemyst.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a legal expert specializing in privacy policies and data protection regulations. 
          Generate comprehensive, professional privacy policies that comply with GDPR, CCPA, and other relevant regulations.
          Always include proper legal disclaimers and ensure the policy is clear and user-friendly.
          Format the output as clean HTML with proper headings and structure.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    return response.choices[0]?.message?.content || generateFallbackPolicy(businessInfo);
  } catch (error) {
    console.error('Error generating privacy policy:', error);
    return generateFallbackPolicy(businessInfo);
  }
}

function createPrivacyPolicyPrompt(businessInfo: BusinessInfo): string {
  const {
    companyName,
    contactEmail,
    website,
    address,
    dataTypes,
    thirdPartyServices,
    regions,
    businessType
  } = businessInfo;

  return `
Generate a comprehensive privacy policy for the following business:

**Company Details:**
- Name: ${companyName}
- Website: ${website}
- Contact Email: ${contactEmail}
- Address: ${address || 'Not provided'}
- Business Type: ${businessType}

**Data Collection:**
The company collects the following types of data:
${dataTypes.map(type => `- ${type}`).join('\n')}

**Third-Party Services:**
The company uses these third-party services:
${thirdPartyServices.map(service => `- ${service}`).join('\n')}

**Geographic Regions:**
The company serves users in:
${regions.map(region => `- ${region}`).join('\n')}

**Requirements:**
1. Include all standard privacy policy sections
2. Address GDPR compliance if serving EU users
3. Address CCPA compliance if serving California users
4. Include specific sections for the data types collected
5. Mention third-party service data sharing
6. Include user rights and contact information
7. Add cookie policy section if applicable
8. Include data retention and security measures
9. Format as clean HTML with proper headings
10. Make it professional but readable

**Structure the policy with these sections:**
1. Introduction
2. Information We Collect
3. How We Use Your Information
4. Information Sharing and Disclosure
5. Data Security
6. Your Rights and Choices
7. Cookies and Tracking Technologies
8. International Data Transfers
9. Data Retention
10. Children's Privacy
11. Changes to This Policy
12. Contact Information

Please generate a complete, professional privacy policy based on this information.
  `;
}

function generateFallbackPolicy(businessInfo: BusinessInfo): string {
  const { companyName, contactEmail, website, dataTypes, regions } = businessInfo;
  
  const hasGDPR = regions.some(region => region.includes('European Union') || region.includes('United Kingdom'));
  const hasCCPA = regions.some(region => region.includes('United States'));

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - ${companyName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .last-updated { background: #ecf0f1; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .contact-info { background: #e8f5e8; padding: 15px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Privacy Policy</h1>
    
    <div class="last-updated">
        <strong>Last Updated:</strong> ${new Date().toLocaleDateString()}
    </div>

    <h2>1. Introduction</h2>
    <p>
        ${companyName} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website ${website} and use our services.
    </p>

    <h2>2. Information We Collect</h2>
    <p>We may collect the following types of information:</p>
    <ul>
        ${dataTypes.map(type => `<li>${type}</li>`).join('')}
    </ul>

    <h2>3. How We Use Your Information</h2>
    <p>We use the information we collect to:</p>
    <ul>
        <li>Provide, operate, and maintain our services</li>
        <li>Improve, personalize, and expand our services</li>
        <li>Understand and analyze how you use our services</li>
        <li>Communicate with you about our services</li>
        <li>Send you marketing and promotional communications (with your consent)</li>
        <li>Process transactions and send related information</li>
        <li>Find and prevent fraud</li>
    </ul>

    <h2>4. Information Sharing and Disclosure</h2>
    <p>
        We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted third parties who assist us in operating our website and conducting our business.
    </p>

    <h2>5. Data Security</h2>
    <p>
        We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
    </p>

    ${hasGDPR ? `
    <h2>6. Your Rights (GDPR)</h2>
    <p>If you are a resident of the European Union, you have the following rights:</p>
    <ul>
        <li>Right to access your personal data</li>
        <li>Right to rectification of inaccurate data</li>
        <li>Right to erasure ("right to be forgotten")</li>
        <li>Right to restrict processing</li>
        <li>Right to data portability</li>
        <li>Right to object to processing</li>
        <li>Right to withdraw consent</li>
    </ul>
    ` : ''}

    ${hasCCPA ? `
    <h2>7. California Privacy Rights (CCPA)</h2>
    <p>If you are a California resident, you have the right to:</p>
    <ul>
        <li>Know what personal information is collected about you</li>
        <li>Know whether your personal information is sold or disclosed</li>
        <li>Say no to the sale of personal information</li>
        <li>Access your personal information</li>
        <li>Request deletion of your personal information</li>
        <li>Equal service and price, even if you exercise your privacy rights</li>
    </ul>
    ` : ''}

    <h2>8. Cookies and Tracking Technologies</h2>
    <p>
        We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
    </p>

    <h2>9. Data Retention</h2>
    <p>
        We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
    </p>

    <h2>10. Children's Privacy</h2>
    <p>
        Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
    </p>

    <h2>11. Changes to This Privacy Policy</h2>
    <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
    </p>

    <div class="contact-info">
        <h2>12. Contact Information</h2>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <ul>
            <li><strong>Email:</strong> ${contactEmail}</li>
            <li><strong>Website:</strong> ${website}</li>
        </ul>
    </div>

    <hr style="margin-top: 40px;">
    <p style="text-align: center; color: #7f8c8d; font-size: 14px;">
        <em>This privacy policy was generated using the Alchemyst AI Platform. Please consult with a legal professional for compliance review.</em>
    </p>
</body>
</html>
  `.trim();
}