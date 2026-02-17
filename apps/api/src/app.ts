import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import onboardingRoutes from './routes/onboarding.routes';
import verificationRoutes from './routes/verification.routes';
import { errorHandler } from './middleware/error.middleware';
import { correlationIdMiddleware, requestLoggerMiddleware } from './middleware/logger.middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(correlationIdMiddleware);
app.use(requestLoggerMiddleware);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/v1/auth', authRoutes);
app.use('/v1', userRoutes);
app.use('/v1/onboarding', onboardingRoutes);
app.use('/v1/verification', verificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
