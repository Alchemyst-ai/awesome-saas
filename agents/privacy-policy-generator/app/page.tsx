'use client';

import { useState } from 'react';
import { Shield, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { generatePrivacyPolicy } from '../lib/privacy-generator';

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

export default function PrivacyPolicyGenerator() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    companyName: '',
    contactEmail: '',
    website: '',
    address: '',
    dataTypes: [],
    thirdPartyServices: [],
    regions: [],
    businessType: 'saas'
  });

  const [generatedPolicy, setGeneratedPolicy] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const dataTypeOptions = [
    'Email addresses',
    'Names and contact information',
    'Usage analytics',
    'Cookies and tracking data',
    'Payment information',
    'Location data',
    'Device information',
    'User-generated content'
  ];

  const serviceOptions = [
    'Google Analytics',
    'Stripe',
    'SendGrid',
    'Mailchimp',
    'Intercom',
    'Hotjar',
    'Mixpanel',
    'AWS',
    'Cloudflare'
  ];

  const regionOptions = [
    'United States',
    'European Union',
    'United Kingdom',
    'Canada',
    'Australia',
    'Global'
  ];

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    if (checked) {
      setBusinessInfo(prev => ({
        ...prev,
        dataTypes: [...prev.dataTypes, dataType]
      }));
    } else {
      setBusinessInfo(prev => ({
        ...prev,
        dataTypes: prev.dataTypes.filter(type => type !== dataType)
      }));
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setBusinessInfo(prev => ({
        ...prev,
        thirdPartyServices: [...prev.thirdPartyServices, service]
      }));
    } else {
      setBusinessInfo(prev => ({
        ...prev,
        thirdPartyServices: prev.thirdPartyServices.filter(s => s !== service)
      }));
    }
  };

  const handleRegionChange = (region: string, checked: boolean) => {
    if (checked) {
      setBusinessInfo(prev => ({
        ...prev,
        regions: [...prev.regions, region]
      }));
    } else {
      setBusinessInfo(prev => ({
        ...prev,
        regions: prev.regions.filter(r => r !== region)
      }));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const policy = await generatePrivacyPolicy(businessInfo);
      setGeneratedPolicy(policy);
    } catch (err) {
      setError('Failed to generate privacy policy. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPolicy = () => {
    const blob = new Blob([generatedPolicy], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessInfo.companyName.replace(/\s+/g, '-').toLowerCase()}-privacy-policy.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100\">
      <div className=\"container mx-auto px-4 py-8\">
        {/* Header */}
        <div className=\"text-center mb-12\">
          <div className=\"flex justify-center mb-4\">
            <Shield className=\"h-16 w-16 text-blue-600\" />
          </div>
          <h1 className=\"text-4xl font-bold text-gray-900 mb-4\">
            Privacy Policy Generator
          </h1>
          <p className=\"text-xl text-gray-600 max-w-2xl mx-auto\">
            Generate professional, GDPR & CCPA compliant privacy policies for your SaaS application using AI
          </p>
        </div>

        <div className=\"grid lg:grid-cols-2 gap-8\">
          {/* Form Section */}
          <div className=\"bg-white rounded-lg shadow-lg p-6\">
            <h2 className=\"text-2xl font-semibold mb-6 flex items-center\">
              <FileText className=\"mr-2\" />
              Business Information
            </h2>

            <div className=\"space-y-6\">
              {/* Basic Info */}
              <div className=\"grid md:grid-cols-2 gap-4\">
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Company Name *
                  </label>
                  <input
                    type=\"text\"
                    value={businessInfo.companyName}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, companyName: e.target.value }))}
                    className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    placeholder=\"Your Company Inc.\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Contact Email *
                  </label>
                  <input
                    type=\"email\"
                    value={businessInfo.contactEmail}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    placeholder=\"privacy@company.com\"
                  />
                </div>
              </div>

              <div className=\"grid md:grid-cols-2 gap-4\">
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Website URL *
                  </label>
                  <input
                    type=\"url\"
                    value={businessInfo.website}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, website: e.target.value }))}
                    className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    placeholder=\"https://yourcompany.com\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Business Type
                  </label>
                  <select
                    value={businessInfo.businessType}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessType: e.target.value }))}
                    className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                  >
                    <option value=\"saas\">SaaS Application</option>
                    <option value=\"ecommerce\">E-commerce</option>
                    <option value=\"blog\">Blog/Content Site</option>
                    <option value=\"marketplace\">Marketplace</option>
                    <option value=\"other\">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  Business Address
                </label>
                <textarea
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                  rows={3}
                  placeholder=\"123 Business St, City, State, ZIP, Country\"
                />
              </div>

              {/* Data Types */}
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-3\">
                  What types of data do you collect? *
                </label>
                <div className=\"grid md:grid-cols-2 gap-2\">
                  {dataTypeOptions.map((dataType) => (
                    <label key={dataType} className=\"flex items-center space-x-2\">
                      <input
                        type=\"checkbox\"
                        checked={businessInfo.dataTypes.includes(dataType)}
                        onChange={(e) => handleDataTypeChange(dataType, e.target.checked)}
                        className=\"rounded border-gray-300 text-blue-600 focus:ring-blue-500\"
                      />
                      <span className=\"text-sm text-gray-700\">{dataType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Third-party Services */}
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-3\">
                  Which third-party services do you use?
                </label>
                <div className=\"grid md:grid-cols-2 gap-2\">
                  {serviceOptions.map((service) => (
                    <label key={service} className=\"flex items-center space-x-2\">
                      <input
                        type=\"checkbox\"
                        checked={businessInfo.thirdPartyServices.includes(service)}
                        onChange={(e) => handleServiceChange(service, e.target.checked)}
                        className=\"rounded border-gray-300 text-blue-600 focus:ring-blue-500\"
                      />
                      <span className=\"text-sm text-gray-700\">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Regions */}
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-3\">
                  Which regions do you serve? *
                </label>
                <div className=\"grid md:grid-cols-2 gap-2\">
                  {regionOptions.map((region) => (
                    <label key={region} className=\"flex items-center space-x-2\">
                      <input
                        type=\"checkbox\"
                        checked={businessInfo.regions.includes(region)}
                        onChange={(e) => handleRegionChange(region, e.target.checked)}
                        className=\"rounded border-gray-300 text-blue-600 focus:ring-blue-500\"
                      />
                      <span className=\"text-sm text-gray-700\">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !businessInfo.companyName || !businessInfo.contactEmail}
                className=\"w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center\"
              >
                {isGenerating ? (
                  <>
                    <div className=\"animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2\"></div>
                    Generating Policy...
                  </>
                ) : (
                  <>
                    <Shield className=\"mr-2 h-5 w-5\" />
                    Generate Privacy Policy
                  </>
                )}
              </button>

              {error && (
                <div className=\"flex items-center text-red-600 bg-red-50 p-3 rounded-md\">
                  <AlertCircle className=\"mr-2 h-5 w-5\" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className=\"bg-white rounded-lg shadow-lg p-6\">
            <h2 className=\"text-2xl font-semibold mb-6 flex items-center\">
              <CheckCircle className=\"mr-2\" />
              Generated Policy
            </h2>

            {generatedPolicy ? (
              <div className=\"space-y-4\">
                <div className=\"flex justify-between items-center\">
                  <span className=\"text-sm text-gray-600\">
                    Policy generated successfully
                  </span>
                  <button
                    onClick={downloadPolicy}
                    className=\"bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center\"
                  >
                    <Download className=\"mr-2 h-4 w-4\" />
                    Download HTML
                  </button>
                </div>
                
                <div 
                  className=\"border border-gray-200 rounded-md p-4 max-h-96 overflow-y-auto bg-gray-50\"
                  dangerouslySetInnerHTML={{ __html: generatedPolicy }}
                />
              </div>
            ) : (
              <div className=\"text-center text-gray-500 py-12\">
                <FileText className=\"mx-auto h-12 w-12 text-gray-300 mb-4\" />
                <p>Fill out the form and click \"Generate Privacy Policy\" to see your custom policy here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className=\"text-center mt-12 text-gray-600\">
          <p>
            Built with ❤️ using{' '}
            <a 
              href=\"https://platform.getalchemystai.com\" 
              target=\"_blank\" 
              rel=\"noopener noreferrer\"
              className=\"text-blue-600 hover:underline\"
            >
              Alchemyst AI Platform
            </a>
          </p>
          <p className=\"text-sm mt-2\">
            ⚠️ This tool generates a basic privacy policy template. Please consult with a legal professional for compliance review.
          </p>
        </div>
      </div>
    </div>
  );
}