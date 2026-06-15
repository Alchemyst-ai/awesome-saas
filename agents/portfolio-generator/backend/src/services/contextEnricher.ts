interface RawData {
  linkedin?: any;
  github?: any;
}

interface EnrichedData {
  linkedin?: any;
  github?: any;
  additionalContext?: string;
  enrichedAt: string;
}

export const contextEnricher = async (
  rawData: RawData,
  additionalInfo?: string
): Promise<EnrichedData> => {
  try {
    // Enrich the data with additional context
    const enrichedData: EnrichedData = {
      ...rawData,
      additionalContext: additionalInfo || 'No additional information provided',
      enrichedAt: new Date().toISOString()
    };

    // Additional processing can be done here
    // For example: data validation, formatting, adding metadata, etc.

    return enrichedData;
  } catch (error) {
    console.error('Error in contextEnricher:', error);
    throw new Error('Failed to enrich context: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
