import app from './app';
import { connectDatabase } from './config/database';
import { config } from './config';

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`Kalanikethan (KNM) API running on port ${config.port} [${config.nodeEnv}]`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
