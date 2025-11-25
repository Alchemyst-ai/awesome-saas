import { formatPromptForV0, sanitizeFormatting } from '../formatting';

describe('Formatting Utilities', () => {
  describe('formatPromptForV0', () => {
    it('should format sections into V0 prompt structure', () => {
      const sections = {
        Description: 'A modern e-commerce website',
        Context: 'This is for selling products online',
        'Technical Requirements': 'NextJS 14, TypeScript, Tailwind CSS',
      };

      const result = formatPromptForV0(sections);

      expect(result).toContain('## Description\n\nA modern e-commerce website');
      expect(result).toContain(
        '## Context\n\nThis is for selling products online'
      );
      expect(result).toContain(
        '## Technical Requirements\n\nNextJS 14, TypeScript, Tailwind CSS'
      );
    });

    it('should handle empty sections object', () => {
      const sections = {};
      const result = formatPromptForV0(sections);
      expect(result).toBe('');
    });

    it('should handle single section', () => {
      const sections = {
        Title: 'Single section content',
      };

      const result = formatPromptForV0(sections);
      expect(result).toBe('## Title\n\nSingle section content');
    });

    it('should preserve section order', () => {
      const sections = {
        First: 'First content',
        Second: 'Second content',
        Third: 'Third content',
      };

      const result = formatPromptForV0(sections);
      const firstIndex = result.indexOf('## First');
      const secondIndex = result.indexOf('## Second');
      const thirdIndex = result.indexOf('## Third');

      expect(firstIndex).toBeLessThan(secondIndex);
      expect(secondIndex).toBeLessThan(thirdIndex);
    });

    it('should handle sections with empty values', () => {
      const sections = {
        Title: 'Content',
        Empty: '',
        Another: 'More content',
      };

      const result = formatPromptForV0(sections);
      expect(result).toContain('## Title\n\nContent');
      expect(result).toContain('## Empty\n\n');
      expect(result).toContain('## Another\n\nMore content');
    });
  });

  describe('sanitizeFormatting', () => {
    it('should remove angle brackets', () => {
      const input = 'Text with <brackets> and >more< brackets';
      const result = sanitizeFormatting(input);
      expect(result).toBe('Text with brackets and more brackets');
    });

    it('should trim whitespace', () => {
      const input = '  Text with spaces  ';
      const result = sanitizeFormatting(input);
      expect(result).toBe('Text with spaces');
    });

    it('should handle empty string', () => {
      const input = '';
      const result = sanitizeFormatting(input);
      expect(result).toBe('');
    });

    it('should handle string with only whitespace', () => {
      const input = '   ';
      const result = sanitizeFormatting(input);
      expect(result).toBe('');
    });

    it('should handle string with only angle brackets', () => {
      const input = '<>';
      const result = sanitizeFormatting(input);
      expect(result).toBe('');
    });

    it('should preserve other special characters', () => {
      const input = 'Text with @#$%^&*()_+-=[]{}|;:,./? characters';
      const result = sanitizeFormatting(input);
      expect(result).toBe('Text with @#$%^&*()_+-=[]{}|;:,./? characters');
    });

    it('should handle mixed content', () => {
      const input = '  <script>alert("test")</script>  ';
      const result = sanitizeFormatting(input);
      expect(result).toBe('scriptalert("test")/script');
    });
  });
});
