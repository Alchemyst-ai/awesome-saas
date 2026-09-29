import { Request, Response } from 'express';
import { portfolioGenerator } from '../services/portfolioGenerator';

export const portfolioController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { linkedinUrl, githubUsername, additionalInfo } = req.body;

    // Validate input
    if (!linkedinUrl && !githubUsername) {
      res.status(400).json({ 
        error: 'At least one of linkedinUrl or githubUsername is required' 
      });
      return;
    }

    // Generate portfolio
    const portfolio = await portfolioGenerator({
      linkedinUrl,
      githubUsername,
      additionalInfo
    });

    res.status(200).json({
      success: true,
      portfolio
    });
  } catch (error) {
    console.error('Error in portfolioController:', error);
    res.status(500).json({ 
      error: 'Failed to generate portfolio',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
