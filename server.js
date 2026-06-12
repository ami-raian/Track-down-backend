const app = require('./src/app');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');

async function start() {
  try {
    await connectDB();
    const server = app.listen(env.port, () => {
      console.log(`🚀 Track Down API running on ${env.serverUrl} (port ${env.port})`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down...`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
