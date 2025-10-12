import {
  ExamplePrompt,
  ExamplePromptTemplate,
  GalleryFilters,
} from '@/types/examples';
import { EXAMPLE_PROMPTS, PROMPT_TEMPLATES } from '@/data/example-prompts';

/**
 * Utility functions for managing examples and templates
 */

/**
 * Get all available tags from examples
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  EXAMPLE_PROMPTS.forEach((example) => {
    example.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Get examples by industry
 */
export function getExamplesByIndustry(industry: string): ExamplePrompt[] {
  return EXAMPLE_PROMPTS.filter((example) => example.industry === industry);
}

/**
 * Get templates by industry
 */
export function getTemplatesByIndustry(
  industry: string
): ExamplePromptTemplate[] {
  return PROMPT_TEMPLATES.filter((template) => template.industry === industry);
}

/**
 * Search examples by query
 */
export function searchExamples(query: string): ExamplePrompt[] {
  const lowercaseQuery = query.toLowerCase();
  return EXAMPLE_PROMPTS.filter((example) => {
    const searchableText =
      `${example.title} ${example.description} ${example.tags.join(' ')}`.toLowerCase();
    return searchableText.includes(lowercaseQuery);
  });
}

/**
 * Filter examples based on multiple criteria
 */
export function filterExamples(filters: GalleryFilters): ExamplePrompt[] {
  return EXAMPLE_PROMPTS.filter((example) => {
    // Industry filter
    if (filters.industry && example.industry !== filters.industry) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty && example.difficulty !== filters.difficulty) {
      return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((filterTag) =>
        example.tags.some((exampleTag) =>
          exampleTag.toLowerCase().includes(filterTag.toLowerCase())
        )
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText =
        `${example.title} ${example.description} ${example.tags.join(' ')}`.toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get recommended examples for a specific use case
 */
export function getRecommendedExamples(
  industry?: string,
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): ExamplePrompt[] {
  let examples = EXAMPLE_PROMPTS;

  if (industry) {
    examples = examples.filter((example) => example.industry === industry);
  }

  if (difficulty) {
    examples = examples.filter((example) => example.difficulty === difficulty);
  }

  // Sort by a combination of factors (for now, just return first 3)
  return examples.slice(0, 3);
}

/**
 * Get example statistics
 */
export function getExampleStats() {
  const industries = new Set<string>();
  const difficulties = new Set<string>();
  const tags = new Set<string>();

  EXAMPLE_PROMPTS.forEach((example) => {
    industries.add(example.industry);
    difficulties.add(example.difficulty);
    example.tags.forEach((tag) => tags.add(tag));
  });

  return {
    totalExamples: EXAMPLE_PROMPTS.length,
    totalTemplates: PROMPT_TEMPLATES.length,
    industries: Array.from(industries),
    difficulties: Array.from(difficulties),
    tags: Array.from(tags),
    industriesCovered: industries.size,
    averageTagsPerExample:
      Math.round((Array.from(tags).length / EXAMPLE_PROMPTS.length) * 10) / 10,
  };
}

/**
 * Validate template placeholders
 */
export function validateTemplate(
  template: ExamplePromptTemplate,
  values: Record<string, string>
): {
  isValid: boolean;
  missingPlaceholders: string[];
  extraValues: string[];
} {
  const templatePlaceholders = Object.keys(template.placeholders);
  const providedValues = Object.keys(values);

  const missingPlaceholders = templatePlaceholders.filter(
    (placeholder) => !providedValues.includes(placeholder)
  );

  const extraValues = providedValues.filter(
    (value) => !templatePlaceholders.includes(value)
  );

  return {
    isValid: missingPlaceholders.length === 0,
    missingPlaceholders,
    extraValues,
  };
}

/**
 * Fill template with provided values
 */
export function fillTemplate(
  template: ExamplePromptTemplate,
  values: Record<string, string>
): string {
  let filledTemplate = template.template;

  Object.entries(values).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    filledTemplate = filledTemplate.replace(
      new RegExp(placeholder, 'g'),
      value
    );
  });

  return filledTemplate;
}

/**
 * Get template usage examples
 */
export function getTemplateExamples(
  templateId: string
): ExamplePromptTemplate['examples'] {
  const template = PROMPT_TEMPLATES.find((t) => t.id === templateId);
  return template?.examples || [];
}

/**
 * Suggest similar examples based on tags
 */
export function getSimilarExamples(
  example: ExamplePrompt,
  limit: number = 3
): ExamplePrompt[] {
  const otherExamples = EXAMPLE_PROMPTS.filter((e) => e.id !== example.id);

  // Calculate similarity score based on shared tags and industry
  const scoredExamples = otherExamples.map((otherExample) => {
    let score = 0;

    // Industry match
    if (otherExample.industry === example.industry) {
      score += 3;
    }

    // Tag matches
    const sharedTags = example.tags.filter((tag) =>
      otherExample.tags.includes(tag)
    );
    score += sharedTags.length;

    // Difficulty similarity
    const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
    const exampleDiffIndex = difficultyOrder.indexOf(example.difficulty);
    const otherDiffIndex = difficultyOrder.indexOf(otherExample.difficulty);
    const difficultyDistance = Math.abs(exampleDiffIndex - otherDiffIndex);
    score += 2 - difficultyDistance; // Closer difficulty = higher score

    return { example: otherExample, score };
  });

  // Sort by score and return top results
  return scoredExamples
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.example);
}

export const exampleUtils = {
  getAllTags,
  getExamplesByIndustry,
  getTemplatesByIndustry,
  searchExamples,
  filterExamples,
  getRecommendedExamples,
  getExampleStats,
  validateTemplate,
  fillTemplate,
  getTemplateExamples,
  getSimilarExamples,
};
