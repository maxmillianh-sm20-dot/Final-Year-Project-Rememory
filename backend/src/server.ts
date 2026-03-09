import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger';
import { initializeFirebaseApp } from './lib/firebaseAdmin';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize Firebase before starting
    initializeFirebaseApp();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`[Server] Backend started on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
