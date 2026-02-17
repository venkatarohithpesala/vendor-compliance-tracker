import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Queue from 'bull';
import { createModuleLogger } from '../utils/loggerFactory.js';

// Load environment variables - search in parent directories for .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const logger = createModuleLogger(import.meta.url);

// Validate required Redis environment variables
const requiredEnvVars = ['REDIS_HOST', 'REDIS_PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Missing required Redis environment variables:', missingVars);
    console.error('Please set the following environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    process.exit(1);
}

// Redis configuration - no defaults for production safety
const redisConfig = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD, 
    prefix: process.env.REDIS_PREFIX , 
    // Add retry strategy for Redis connection
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
};

// Validate Redis port is a valid number
if (isNaN(redisConfig.port) || redisConfig.port < 1 || redisConfig.port > 65535) {
    console.error('Invalid REDIS_PORT:', process.env.REDIS_PORT, '- must be a valid port number (1-65535)');
    process.exit(1);
}

console.log(`Redis connected: ${redisConfig.host}:${redisConfig.port}`);

const emailQueue = new Queue('emailQueue', {
    redis: redisConfig,
    limiter: {
        max: 2, // max 2 jobs per
        duration: 1000 // 1 second
    },
    defaultJobOptions: {
        attempts: 3, // Default retry attempts
        backoff: {
            type: 'exponential',
            delay: 2000 // Initial delay of 2 seconds
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 100 // Keep last 100 failed jobs
    }
});

// Add queue event handlers
emailQueue.on('completed', job => {
    logger.info(`Email job ${job.id} completed successfully`, {
        jobId: job.id,
        emailId: job.data.emailId,
        template: job.data.template
    });
});

emailQueue.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed`, {
        jobId: job.id,
        emailId: job.data.emailId,
        template: job.data.template,
        error: err.message,
        attempt: job.attemptsMade
    });
});

emailQueue.on('stalled', (job) => {
    logger.warn(`Email job ${job.id} stalled`, {
        jobId: job.id,
        emailId: job.data.emailId
    });
});

emailQueue.on('error', (error) => {
    logger.error('Queue error occurred', { error: error.message });
});

export default emailQueue;