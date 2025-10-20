import Queue from 'bull';
import 'dotenv/config';
import { createModuleLogger } from '../utils/loggerFactory';

const logger = createModuleLogger(import.meta.url);

const emailQueue = new Queue('emailQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        prefix: `${process.env.REDIS_PREFIX}email:`,
        // Add retry strategy for Redis connection
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        }
    },
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