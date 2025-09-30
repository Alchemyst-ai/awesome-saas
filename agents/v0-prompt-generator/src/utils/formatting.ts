// Formatting utilities for prompts and text

export const formatPromptForV0 = (sections: Record<string, string>): string => {
  return Object.entries(sections)
    .map(([key, value]) => `## ${key}\n\n${value}`)
    .join('\n\n');
};

export const sanitizeFormatting = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
