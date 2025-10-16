import redisClient from '../config/redis.js';
import 'dotenv/config';

export const blacklistToken = async (token) => {
    try {
        await redisClient.setEx(
            `blacklist:${token}`, 
            parseInt(process.env.TOKEN_BLACKLIST_DURATION), 
            'true'
        );
    } catch (error) {
        console.error('Error blacklisting token:', error);
        throw error;
    }
};

export const isTokenBlacklisted = async (token) => {
    try {
        const blacklisted = await redisClient.get(`blacklist:${token}`);
        return !!blacklisted;
    } catch (error) {
        console.error('Error checking blacklisted token:', error);
        return false;
    }
};

export const cacheUserData = async (userId, userData, duration = parseInt(process.env.REDIS_TTL)) => {
    try {
        await redisClient.setEx(`user:${userId}`, duration, JSON.stringify(userData));
    } catch (error) {
        console.error('Error caching user data:', error);
    }
};

export const getCachedUserData = async (userId) => {
    try {
        const userData = await redisClient.get(`user:${userId}`);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting cached user data:', error);
        return null;
    }
};