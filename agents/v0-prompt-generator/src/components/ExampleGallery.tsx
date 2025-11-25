'use client';

import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  LightBulbIcon,
  PlayIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  ExamplePrompt,
  ExamplePromptTemplate,
  GalleryFilters,
  InteractiveExample,
} from '@/types/examples';
import {
  EXAMPLE_PROMPTS,
  PROMPT_TEMPLATES,
  INTERACTIVE_EXAMPLES,
} from '@/data/example-prompts';
import { INDUSTRY_CONFIGS } from '@/lib/industry-config';

interface ExampleGalleryProps {
  onSelectExample?: (prompt: string) => void;
  onSelectTemplate?: (template: ExamplePromptTemplate) => void;
}

export function ExampleGallery({
  onSelectExample,
  onSelectTemplate,
}: ExampleGalleryProps) {
  const [activeTab, setActiveTab] = useState<
    'examples' | 'templates' | 'interactive'
  >('examples');
  const [filters, setFilters] = useState<GalleryFilters>({});
  const [expandedExample, setExpandedExample] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter examples based on current filters
  const filteredExamples = useMemo(() => {
    return EXAMPLE_PROMPTS.filter((example) => {
      if (filters.industry && example.industry !== filters.industry)
        return false;
      if (filters.difficulty && example.difficulty !== filters.difficulty)
        return false;
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) =>
          example.tags.some((exampleTag) =>
            exampleTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText =
          `${example.title} ${example.description} ${example.tags.join(' ')}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      return true;
    });
  }, [filters]);

  // Filter templates based on current filters
  const filteredTemplates = useMemo(() => {
    return PROMPT_TEMPLATES.filter((template) => {
      if (filters.industry && template.industry !== filters.industry)
        return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText =
          `${template.name} ${template.description}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      return true;
    });
  }, [filters]);

  const handleCopyPrompt = async (prompt: string, id: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Example Gallery & Templates
        </h1>
        <p className="text-lg text-gray-600">
          Explore sample prompts, reusable templates, and interactive examples
          to master V0 prompt creation
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'examples', label: 'Example Prompts', icon: LightBulbIcon },
            {
              id: 'templates',
              label: 'Templates',
              icon: ClipboardDocumentIcon,
            },
            {
              id: 'interactive',
              label: 'Interactive Examples',
              icon: PlayIcon,
            },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() =>
                setActiveTab(id as 'examples' | 'templates' | 'interactive')
              }
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search examples, templates, or features..."
            value={filters.searchQuery || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Industry Filter */}
        <select
          value={filters.industry || ''}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              industry: e.target.value || undefined,
            }))
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Industries</option>
          {Object.entries(INDUSTRY_CONFIGS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.displayName}
            </option>
          ))}
        </select>

        {/* Difficulty Filter (for examples) */}
        {activeTab === 'examples' && (
          <select
            value={filters.difficulty || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                difficulty:
                  (e.target.value as
                    | 'beginner'
                    | 'intermediate'
                    | 'advanced') || undefined,
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        )}

        {/* Clear Filters */}
        {(filters.industry || filters.difficulty || filters.searchQuery) && (
          <button
            onClick={() => setFilters({})}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'examples' && (
        <ExamplePromptsTab
          examples={filteredExamples}
          expandedExample={expandedExample}
          setExpandedExample={setExpandedExample}
          copiedId={copiedId}
          onCopyPrompt={handleCopyPrompt}
          onSelectExample={onSelectExample}
          getDifficultyColor={getDifficultyColor}
        />
      )}

      {activeTab === 'templates' && (
        <TemplatesTab
          templates={filteredTemplates}
          copiedId={copiedId}
          onCopyPrompt={handleCopyPrompt}
          onSelectTemplate={onSelectTemplate}
        />
      )}

      {activeTab === 'interactive' && (
        <InteractiveTab examples={INTERACTIVE_EXAMPLES} />
      )}
    </div>
  );
}

// Example Prompts Tab Component
function ExamplePromptsTab({
  examples,
  expandedExample,
  setExpandedExample,
  copiedId,
  onCopyPrompt,
  onSelectExample,
  getDifficultyColor,
}: {
  examples: ExamplePrompt[];
  expandedExample: string | null;
  setExpandedExample: (id: string | null) => void;
  copiedId: string | null;
  onCopyPrompt: (prompt: string, id: string) => void;
  onSelectExample?: (prompt: string) => void;
  getDifficultyColor: (difficulty: string) => string;
}) {
  if (examples.length === 0) {
    return (
      <div className="text-center py-12">
        <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No examples found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters to see more examples.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {examples.map((example) => (
        <div
          key={example.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {example.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(example.difficulty)}`}
                  >
                    {example.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {INDUSTRY_CONFIGS[example.industry]?.displayName ||
                      example.industry}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{example.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {example.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Key Features:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {example.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onCopyPrompt(example.fullPrompt, example.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    copiedId === example.id
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {copiedId === example.id ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                {onSelectExample && (
                  <button
                    onClick={() => onSelectExample(example.fullPrompt)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Use This Prompt
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Content */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() =>
                  setExpandedExample(
                    expandedExample === example.id ? null : example.id
                  )
                }
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {expandedExample === example.id ? (
                  <ChevronDownIcon className="w-5 h-5" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5" />
                )}
                <span>View Full Prompt & Explanation</span>
              </button>

              {expandedExample === example.id && (
                <div className="mt-4 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  {/* Full Prompt */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Full Prompt
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                        {example.fullPrompt}
                      </pre>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Why This Prompt Works
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-blue-900 mb-4">
                        {example.explanation.why}
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-blue-900 mb-2">
                            Key Elements:
                          </h5>
                          <ul className="space-y-1">
                            {example.explanation.keyElements.map(
                              (element, index) => (
                                <li
                                  key={index}
                                  className="text-blue-800 text-sm flex items-start"
                                >
                                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {element}
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-blue-900 mb-2">
                            Pro Tips:
                          </h5>
                          <ul className="space-y-1">
                            {example.explanation.tips.map((tip, index) => (
                              <li
                                key={index}
                                className="text-blue-800 text-sm flex items-start"
                              >
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Templates Tab Component
function TemplatesTab({
  templates,
  copiedId,
  onCopyPrompt,
  onSelectTemplate,
}: {
  templates: ExamplePromptTemplate[];
  copiedId: string | null;
  onCopyPrompt: (prompt: string, id: string) => void;
  onSelectTemplate?: (template: ExamplePromptTemplate) => void;
}) {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardDocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No templates found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters to see more templates.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    {INDUSTRY_CONFIGS[template.industry]?.displayName ||
                      template.industry}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{template.description}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onCopyPrompt(template.template, template.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    copiedId === template.id
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                >
                  {copiedId === template.id ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                {onSelectTemplate && (
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Use Template
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Content */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() =>
                  setExpandedTemplate(
                    expandedTemplate === template.id ? null : template.id
                  )
                }
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                {expandedTemplate === template.id ? (
                  <ChevronDownIcon className="w-5 h-5" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5" />
                )}
                <span>View Template & Instructions</span>
              </button>

              {expandedTemplate === template.id && (
                <div className="mt-4 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  {/* Template */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Template
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                        {template.template}
                      </pre>
                    </div>
                  </div>

                  {/* Instructions & Placeholders */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Instructions
                      </h4>
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <ol className="space-y-2">
                          {template.instructions.map((instruction, index) => (
                            <li
                              key={index}
                              className="text-yellow-900 text-sm flex items-start"
                            >
                              <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </span>
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Placeholders
                      </h4>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="space-y-3">
                          {Object.entries(template.placeholders).map(
                            ([key, description]) => (
                              <div key={key}>
                                <code className="text-green-800 font-mono text-sm bg-green-100 px-2 py-1 rounded">
                                  {`{${key}}`}
                                </code>
                                <p className="text-green-700 text-sm mt-1">
                                  {description}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Example Results
                    </h4>
                    <div className="space-y-4">
                      {template.examples.map((example, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                        >
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-blue-900 mb-2">
                                Input:
                              </h5>
                              <div className="text-blue-800 text-sm space-y-1">
                                <p>
                                  <strong>Name:</strong> {example.websiteName}
                                </p>
                                <p>
                                  <strong>About:</strong> {example.aboutInfo}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-blue-900 mb-2">
                                Result:
                              </h5>
                              <p className="text-blue-800 text-sm">
                                {example.result}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Interactive Tab Component
function InteractiveTab({ examples }: { examples: InteractiveExample[] }) {
  const [selectedExample, setSelectedExample] =
    useState<InteractiveExample | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  if (!selectedExample) {
    return (
      <div className="grid gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Interactive Learning
          </h3>
          <p className="text-gray-700 mb-4">
            Explore how different prompt modifications affect the final output.
            See the evolution from basic to comprehensive prompts.
          </p>
        </div>

        {examples.map((example) => (
          <div
            key={example.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {example.title}
            </h3>
            <p className="text-gray-600 mb-4">{example.description}</p>
            <button
              onClick={() => setSelectedExample(example)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Start Interactive Example
            </button>
          </div>
        ))}
      </div>
    );
  }

  const allSteps = [
    {
      name: 'Initial',
      input: selectedExample.initialInput,
      result: selectedExample.expectedOutput,
      description: undefined,
    },
    ...selectedExample.modifications.map((mod) => ({
      name: mod.name,
      input: { ...selectedExample.initialInput, ...mod.changes },
      result: mod.expectedResult,
      description: mod.description,
    })),
  ];

  const currentStepData = allSteps[currentStep];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setSelectedExample(null)}
          className="text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          ← Back to Examples
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedExample.title}
        </h2>
        <p className="text-gray-600">{selectedExample.description}</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {allSteps.length}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentStep(Math.min(allSteps.length - 1, currentStep + 1))
              }
              disabled={currentStep === allSteps.length - 1}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / allSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentStepData.name} Input
          </h3>
          {currentStepData.description && (
            <p className="text-blue-600 text-sm mb-4 bg-blue-50 p-3 rounded">
              {currentStepData.description}
            </p>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website Name
              </label>
              <div className="p-2 bg-gray-50 rounded border text-sm">
                {currentStepData.input.websiteName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <div className="p-2 bg-gray-50 rounded border text-sm">
                {currentStepData.input.industry}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About
              </label>
              <div className="p-2 bg-gray-50 rounded border text-sm">
                {currentStepData.input.aboutInfo}
              </div>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expected Result
          </h3>
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <p className="text-green-800">{currentStepData.result}</p>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          {allSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
