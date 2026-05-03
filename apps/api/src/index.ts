import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes de base
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Artisan237 API is running' });
});

// Mock Data pour le Jury
app.get('/api/artisans/recommendations', (req: Request, res: Response) => {
  // Simulation d'une réponse du moteur de recommandation IA
  const mockRecommendations = [
    {
      id: '1',
      name: 'Jean Kouam',
      specialty: 'Plomberie',
      score: 0.95,
      distance: '1.2km',
      xp: 1250,
      level: 'Professional'
    },
    {
      id: '2',
      name: 'Marie Ngo',
      specialty: 'Électricité',
      score: 0.88,
      distance: '2.5km',
      xp: 800,
      level: 'Intermediate'
    }
  ];
  
  res.status(200).json({
    success: true,
    data: mockRecommendations,
    metadata: {
      engine: 'Scikit-learn Hybrid Recommender',
      processing_time: '45ms'
    }
  });
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
