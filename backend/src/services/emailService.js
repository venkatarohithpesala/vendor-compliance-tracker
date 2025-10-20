import { createModuleLogger } from '../utils/loggerFactory';
import { emailQueue } from '../config/emailQueue';
import { Email } from '../models/index.js';
import 'dotenv/config';

const logger = createModuleLogger(import.meta.url);

class EmailService {
    constructor() {
        // Empty constructor - no initialization needed
    }

    /**
     * Get status of an email
     * @param {number} emailId - The ID of the email to check
     * @returns {Promise<Object>} The email record
     */
    async getEmailStatus(emailId) {
        return await Email.findByPk(emailId);
    }

    // Queue an email
    async queueEmail(options) {
        try {
            // First create the email record
            const email = await Email.create({
                toAddress: options.to,
                subject: options.subject,
                template: options.template,
                context: options.context,
                status: 'queued'
            });

            // Then add it to the queue
            const jobOptions = {
                ...options,
                emailId: email.id
            };
            await emailQueue.add('send-email', jobOptions);

            return email;
        } catch (error) {
            logger.error('Email queuing error:', error);
            throw error;
        }
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    await emailQueue.close();
    process.exit(0);
});

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;