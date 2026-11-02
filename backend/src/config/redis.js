import { createClient } from 'redis';
import 'dotenv/config';

const redisConfig = {
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        tls: process.env.REDIS_ENABLE_TLS === 'true'
    },
    prefix: process.env.REDIS_PREFIX,
    password: process.env.REDIS_PASSWORD
};

const redisClient = createClient(redisConfig);

redisClient.on('connect', () => {
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Connection handler
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Successfully connected to Redis');
    } catch (error) {
        console.error('Redis connection error:', error);
        // Retry connection after 5 seconds
        setTimeout(connectRedis, 5000);
    }
};

// Initial connection
connectRedis();

export default redisClient;