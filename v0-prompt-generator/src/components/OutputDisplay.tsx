'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GeneratedPrompt } from '@/types';

interface OutputDisplayProps {
  prompt: GeneratedPrompt;
  onEdit: (editedPrompt: string) => void;
  onCopy: () => void;
}

interface CopyState {
  copied: boolean;
  error: boolean;
  message: string;
}

interface ExpandedSections {
  [key: string]: boolean;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({
  prompt,
  onEdit,
  onCopy,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(prompt.fullPrompt);
  const [copyState, setCopyState] = useState<CopyState>({
    copied: false,
    error: false,
    message: '',
  });
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    explanation: false,
    context: false,
    technical: false,
    features: false,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout>();

  // Update edited content when prompt changes
  useEffect(() => {
    setEditedContent(prompt.fullPrompt);
  }, [prompt.fullPrompt]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight();
    }
  }, [isEditing, editedContent, adjustTextareaHeight]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    const contentToCopy = isEditing ? editedContent : prompt.fullPrompt;

    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(contentToCopy);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = contentToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopyState({
        copied: true,
        error: false,
        message: 'Prompt copied to clipboard!',
      });

      onCopy();

      // Clear copy state after 3 seconds
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopyState((prev) => ({ ...prev, copied: false, message: '' }));
      }, 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyState({
        copied: false,
        error: true,
        message: 'Failed to copy. Please select and copy manually.',
      });

      // Clear error state after 5 seconds
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopyState((prev) => ({ ...prev, error: false, message: '' }));
      }, 5000);
    }
  }, [isEditing, editedContent, prompt.fullPrompt, onCopy]);

  // Handle edit mode toggle
  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // Save changes
      onEdit(editedContent);
    }
    setIsEditing(!isEditing);
  }, [isEditing, editedContent, onEdit]);

  // Handle content change in edit mode
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditedContent(e.target.value);
    },
    []
  );

  // Handle section expansion toggle
  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Render syntax highlighting for prompt content
  const renderHighlightedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="font-mono text-sm leading-relaxed">
        {lines.map((line, index) => {
          const isHeader = line.startsWith('#');
          const isBold = line.includes('**') && !isHeader;
          const isListItem =
            line.trim().startsWith('-') || line.trim().startsWith('*');

          return (
            <div
              key={index}
              className={`${
                isHeader
                  ? 'font-bold text-blue-900 mt-4 mb-2'
                  : isBold
                    ? 'font-semibold'
                    : isListItem
                      ? 'text-gray-700 ml-4'
                      : 'text-gray-800'
              }`}
            >
              {line || '\u00A0'} {/* Non-breaking space for empty lines */}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-responsive-lg font-bold text-gray-900 mb-2">
                Generated V0 Prompt
              </h2>
              <p className="text-gray-600 text-responsive-base">
                Your optimized prompt for {prompt.title}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:flex-shrink-0">
              <button
                onClick={handleEditToggle}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                  isEditing
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
                aria-pressed={isEditing}
                aria-describedby="edit-button-description"
              >
                {isEditing ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Save Changes</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit Prompt</span>
                  </div>
                )}
              </button>
              <span id="edit-button-description" className="sr-only">
                {isEditing
                  ? 'Save your changes to the prompt'
                  : 'Edit the generated prompt'}
              </span>

              <button
                onClick={handleCopy}
                disabled={copyState.copied}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
                  copyState.copied
                    ? 'bg-green-600 text-white focus:ring-green-500'
                    : copyState.error
                      ? 'bg-red-600 text-white focus:ring-red-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                }`}
                aria-describedby="copy-button-description"
              >
                <div className="flex items-center justify-center">
                  {copyState.copied ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : copyState.error ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Error</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      <span className="hidden sm:inline">Copy Prompt</span>
                      <span className="sm:hidden">Copy</span>
                    </>
                  )}
                </div>
              </button>
              <span id="copy-button-description" className="sr-only">
                Copy the generated prompt to your clipboard
              </span>
            </div>
          </div>

          {/* Copy feedback message */}
          {copyState.message && (
            <div
              className={`p-3 rounded-lg mb-4 animate-slide-up ${
                copyState.error
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}
              role={copyState.error ? 'alert' : 'status'}
              aria-live={copyState.error ? 'assertive' : 'polite'}
            >
              <div className="flex items-center">
                {copyState.error ? (
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="text-sm font-medium">{copyState.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Prompt Content */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                V0 Prompt Content
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing
                  ? 'Edit your prompt below'
                  : 'Ready to copy and paste into V0'}
              </p>
            </div>

            <div className="p-4">
              {isEditing ? (
                <div>
                  <label htmlFor="prompt-editor" className="sr-only">
                    Edit V0 prompt content
                  </label>
                  <textarea
                    id="prompt-editor"
                    ref={textareaRef}
                    value={editedContent}
                    onChange={handleContentChange}
                    className="w-full min-h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed resize-none"
                    placeholder="Edit your V0 prompt here..."
                    style={{ minHeight: '400px' }}
                    aria-describedby="prompt-editor-help"
                  />
                  <p
                    id="prompt-editor-help"
                    className="mt-2 text-xs text-gray-500"
                  >
                    Make any changes to customize your prompt before copying to
                    V0
                  </p>
                </div>
              ) : (
                <div
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto scrollbar-thin"
                  role="region"
                  aria-label="Generated prompt content"
                  tabIndex={0}
                >
                  {renderHighlightedContent(prompt.fullPrompt)}
                </div>
              )}
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-4">
            {/* Prompt Explanation */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('explanation')}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-all duration-200 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-t-lg"
                aria-expanded={expandedSections.explanation}
                aria-controls="explanation-content"
                id="explanation-button"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Prompt Explanation
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Understanding why this prompt works well
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${
                    expandedSections.explanation ? 'rotate-180' : ''
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {expandedSections.explanation && (
                <div
                  id="explanation-content"
                  className="px-4 py-3 border-t border-gray-200 animate-slide-up"
                  role="region"
                  aria-labelledby="explanation-button"
                >
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 mb-4">
                      <strong>Why this prompt is effective:</strong>
                    </p>
                    <p className="text-gray-600 mb-4">
                      {prompt.explanation.reasoning}
                    </p>

                    <div className="space-y-3">
                      {Object.entries(prompt.explanation.sections).map(
                        ([section, explanation]) => (
                          <div
                            key={section}
                            className="bg-blue-50 p-3 rounded-lg border border-blue-100"
                          >
                            <h5 className="font-semibold text-blue-900 capitalize mb-1">
                              {section.replace(/([A-Z])/g, ' $1').trim()}
                            </h5>
                            <p className="text-blue-800 text-sm leading-relaxed">
                              {explanation}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Industry Features */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('features')}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-all duration-200 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-t-lg"
                aria-expanded={expandedSections.features}
                aria-controls="features-content"
                id="features-button"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Industry-Specific Features
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Recommended features for your industry
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${
                    expandedSections.features ? 'rotate-180' : ''
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {expandedSections.features && (
                <div
                  id="features-content"
                  className="px-4 py-3 border-t border-gray-200 animate-slide-up"
                  role="region"
                  aria-labelledby="features-button"
                >
                  <div className="prose prose-sm max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {prompt.industryFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="bg-green-50 p-3 rounded-lg border border-green-200"
                        >
                          <div className="flex items-start">
                            <svg
                              className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm text-green-800">
                              {feature}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <span className="mr-2" role="img" aria-label="lightbulb">
                💡
              </span>
              Tips for using this prompt with V0:
            </h4>
            <ul className="text-sm text-blue-700 space-y-2" role="list">
              <li className="flex items-start">
                <span className="mr-2 flex-shrink-0" aria-hidden="true">
                  •
                </span>
                <span>
                  Copy the entire prompt and paste it into V0&apos;s input field
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex-shrink-0" aria-hidden="true">
                  •
                </span>
                <span>
                  You can edit the prompt above to add more specific
                  requirements
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex-shrink-0" aria-hidden="true">
                  •
                </span>
                <span>
                  If V0&apos;s first result isn&apos;t perfect, try refining
                  specific sections
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex-shrink-0" aria-hidden="true">
                  •
                </span>
                <span>
                  The technical specifications ensure modern, maintainable code
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputDisplay;
