import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Creates a module-specific logger
 * @param {string} moduleUrl - The import.meta.url of the calling module
 * @returns {Object} Logger object with info, error, warn methods
 */
export function createModuleLogger(moduleUrl) {
    // Convert file URL to file path and extract module name
    const filePath = fileURLToPath(moduleUrl);
    const moduleName = path.basename(filePath, path.extname(filePath));

    const createLogMessage = (level, message, meta = {}) => {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            module: moduleName,
            message,
            ...meta
        };

        // In production, you might want to use a proper logging library like winston
        // For now, using console with structured output
        console.log(JSON.stringify(logEntry));
    };

    return {
        info: (message, meta) => createLogMessage('info', message, meta),
        error: (message, meta) => createLogMessage('error', message, meta),
        warn: (message, meta) => createLogMessage('warn', message, meta),
        debug: (message, meta) => {
            if (process.env.NODE_ENV !== 'production') {
                createLogMessage('debug', message, meta);
            }
        }
    };
}