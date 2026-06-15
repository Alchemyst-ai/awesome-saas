import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { portfolioController } from './controllers/portfolioController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/generate-portfolio', portfolioController);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Portfolio Generator API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
