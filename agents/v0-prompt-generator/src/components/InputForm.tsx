'use client';

import React, { useState } from 'react';
import { UserInput } from '@/types';
import { getIndustryDisplayNames } from '@/lib/industry-config';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
  initialValues?: Partial<UserInput>;
}

const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  isLoading,
  initialValues,
}) => {
  // Simple form state management
  const [formData, setFormData] = useState<UserInput>({
    websiteName: initialValues?.websiteName || '',
    industry: initialValues?.industry || '',
    aboutInfo: initialValues?.aboutInfo || '',
    additionalRequirements: initialValues?.additionalRequirements || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const industryOptions = getIndustryDisplayNames();

  // Simple field change handler
  const handleFieldChange = (fieldName: keyof UserInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Simple validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.websiteName.trim()) {
      newErrors.websiteName = 'Website name is required';
    } else if (formData.websiteName.length < 2) {
      newErrors.websiteName = 'Website name must be at least 2 characters';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!formData.aboutInfo.trim()) {
      newErrors.aboutInfo = 'Please describe your website';
    } else if (formData.aboutInfo.length < 10) {
      newErrors.aboutInfo = 'Please provide more details (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading || isSubmitting) return;

    setIsSubmitting(true);

    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  };

  const isSubmitDisabled = isLoading || isSubmitting || !formData.websiteName.trim() || !formData.industry || !formData.aboutInfo.trim();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-pink-100 rounded-full blur-2xl opacity-40 translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          <div className="mb-8 sm:mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Create Your Perfect V0 Prompt
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your website vision into a comprehensive, AI-optimized prompt that generates stunning results with Vercel V0
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>    
      {/* Website Name Field */}
          <div className="group">
            <label
              htmlFor="websiteName"
              className="block text-sm font-semibold text-gray-800 mb-3 flex items-center"
            >
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mr-3">
                1
              </span>
              Website Name{' '}
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            </label>
            <div className="relative">
              <input
                id="websiteName"
                name="websiteName"
                type="text"
                value={formData.websiteName}
                onChange={(e) => handleFieldChange('websiteName', e.target.value)}
                placeholder="e.g., TaskFlow Pro, Bella's Boutique, John Smith Portfolio"
                className={`${
                  errors.websiteName
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 bg-white focus:ring-blue-500 focus:border-blue-500 group-hover:border-gray-300'
                } w-full px-4 py-4 rounded-xl transition-all duration-200 shadow-sm focus:shadow-md text-gray-900 placeholder-gray-400`}
                disabled={isLoading}
                maxLength={100}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            {errors.websiteName && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.websiteName}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The name of your website or business (2-100 characters)
            </p>
          </div>

          {/* Industry Field */}
          <div className="group">
            <label
              htmlFor="industry"
              className="block text-sm font-semibold text-gray-800 mb-3 flex items-center"
            >
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-xs font-bold mr-3">
                2
              </span>
              Industry{' '}
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            </label>
            <div className="relative">
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={(e) => handleFieldChange('industry', e.target.value)}
                className={`${
                  errors.industry
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 bg-white focus:ring-blue-500 focus:border-blue-500 group-hover:border-gray-300'
                } w-full px-4 py-4 rounded-xl transition-all duration-200 shadow-sm focus:shadow-md text-gray-900 appearance-none cursor-pointer`}
                disabled={isLoading}
                required
              >
                <option value="">Select your industry...</option>
                {Object.entries(industryOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.industry}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Choose the industry that best describes your business
            </p>
          </div>

          {/* About Info Field */}
          <div className="group">
            <label
              htmlFor="aboutInfo"
              className="block text-sm font-semibold text-gray-800 mb-3 flex items-center"
            >
              <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-bold mr-3">
                3
              </span>
              About Your Website{' '}
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            </label>
            <div className="relative">
              <textarea
                id="aboutInfo"
                name="aboutInfo"
                value={formData.aboutInfo}
                onChange={(e) => handleFieldChange('aboutInfo', e.target.value)}
                placeholder="Describe what your website is about, its main purpose, target audience, and key features you want to include..."
                rows={5}
                className={`${
                  errors.aboutInfo
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-200 bg-white focus:ring-blue-500 focus:border-blue-500 group-hover:border-gray-300'
                } w-full px-4 py-4 rounded-xl transition-all duration-200 shadow-sm focus:shadow-md text-gray-900 placeholder-gray-400 resize-vertical min-h-[120px]`}
                disabled={isLoading}
                maxLength={1000}
                required
              />
              <div className="absolute top-4 right-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mt-1 gap-1">
              <div className="flex-1">
                {errors.aboutInfo && (
                  <p className="text-sm text-red-600 mb-1" role="alert">
                    {errors.aboutInfo}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Provide details about your website's purpose and features (10-1000 characters)
                </p>
              </div>
              <span className="text-xs text-gray-400 sm:ml-2 flex-shrink-0" aria-live="polite">
                {formData.aboutInfo.length}/1000
              </span>
            </div>
          </div>

          {/* Additional Requirements Field */}
          <div className="group">
            <label
              htmlFor="additionalRequirements"
              className="block text-sm font-semibold text-gray-800 mb-3 flex items-center"
            >
              <span className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-xs font-bold mr-3">
                4
              </span>
              Additional Requirements{' '}
              <span className="text-gray-500 ml-2 text-xs font-normal bg-gray-100 px-2 py-1 rounded-full">
                Optional
              </span>
            </label>
            <div className="relative">
              <textarea
                id="additionalRequirements"
                name="additionalRequirements"
                value={formData.additionalRequirements || ''}
                onChange={(e) => handleFieldChange('additionalRequirements', e.target.value)}
                placeholder="Any specific features, design preferences, or technical requirements..."
                rows={4}
                className="border-gray-200 bg-white focus:ring-blue-500 focus:border-blue-500 group-hover:border-gray-300 w-full px-4 py-4 rounded-xl transition-all duration-200 shadow-sm focus:shadow-md text-gray-900 placeholder-gray-400 resize-vertical min-h-[100px]"
                disabled={isLoading}
                maxLength={500}
              />
              <div className="absolute top-4 right-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mt-1 gap-1">
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  Optional: Specify any additional requirements or preferences (max 500 characters)
                </p>
              </div>
              <span className="text-xs text-gray-400 sm:ml-2 flex-shrink-0" aria-live="polite">
                {(formData.additionalRequirements || '').length}/500
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8 sm:pt-10">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 focus:ring-4 focus:ring-offset-2 transform ${
                isSubmitDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] focus:ring-blue-500 active:scale-[0.98]'
              } relative overflow-hidden`}
            >
              {/* Button background animation */}
              {!isSubmitDisabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              )}
              
              <span className="relative flex items-center justify-center">
                {isLoading || isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Generating Your Perfect Prompt...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate My V0 Prompt</span>
                  </>
                )}
              </span>
            </button>
            {isSubmitDisabled && !isLoading && !isSubmitting && (
              <p className="mt-2 text-xs text-gray-500 text-center">
                Please fill in all required fields to continue
              </p>
            )}
          </div>

          {/* Form Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-slide-up"
              role="alert"
            >
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start">
                    <span className="mr-2 flex-shrink-0">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {/* Help Text */}
        <div className="mt-10 sm:mt-12 relative">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-2xl opacity-20"></div>
            
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Pro Tips for Amazing Results
                </h4>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Be specific about your target audience and main goals
                  </span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Mention key features or functionality you need
                  </span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Include design preferences or brand requirements
                  </span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    More context = better generated prompts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;