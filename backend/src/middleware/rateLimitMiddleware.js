import redisClient from '../config/redis.js';
import 'dotenv/config';

// Get rate limit settings from environment variables
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW); // Time window in seconds
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS); // Max requests per window

const rateLimit = async (req, res, next) => {
    try {
        const ip = req.ip;
        const key = `rateLimit:${ip}`;
        
        // Get the number of requests made by this IP
        const requests = await redisClient.get(key);
        
        if (!requests) {
            // First request, set to 1 with configured expiry
            await redisClient.setEx(key, RATE_LIMIT_WINDOW, 1);
            return next();
        }
        
        const requestCount = parseInt(requests);
        
        if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
            return res.status(429).json({
                error: `Too many requests. Please try again after ${RATE_LIMIT_WINDOW} seconds.`
            });
        }
        
        await redisClient.incr(key);
        next();
        
    } catch (error) {
        console.error('Rate limiting error:', error);
        next(); // Continue on redis error
    }
};

export default rateLimit;