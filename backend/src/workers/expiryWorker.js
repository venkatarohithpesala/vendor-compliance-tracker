import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Queue from 'bull';
import { VendorCompliance, Vendor, ComplianceRequirement, Email } from '../models/index.js';
import { Op } from 'sequelize';
import { createModuleLogger } from '../utils/loggerFactory.js';
import emailQueue from '../config/emailQueue.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const logger = createModuleLogger(import.meta.url);

// Redis configuration for the expiry queue itself
const redisConfig = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
};

const expiryQueue = new Queue('expiryQueue', { redis: redisConfig });

// Process the expiry check job
expiryQueue.process('check-expiries', async (job) => {
    logger.info('Starting daily compliance expiry check...');

    try {
        const checkIntervals = [30, 15, 7, 1]; // Days to remind
        let totalRemindersSent = 0;

        for (const days of checkIntervals) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + days);

            // Set time to start of day for accurate day-matching
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            const expiringRecords = await VendorCompliance.findAll({
                where: {
                    status: 'compliant',
                    expiryDate: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                },
                include: [
                    { model: Vendor, as: 'vendor' },
                    { model: ComplianceRequirement, as: 'requirement' }
                ]
            });

            logger.info(`Found ${expiringRecords.length} records expiring in ${days} days.`);

            for (const record of expiringRecords) {
                // Check if we already sent a reminder for this specific day to avoid spam if worker restarts
                const alreadySent = await Email.findOne({
                    where: {
                        to: record.vendor.email,
                        template: 'compliance_reminder',
                        subject: { [Op.like]: `%${record.requirement.name}%` },
                        createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
                    }
                });

                if (alreadySent) continue;

                // Create email record and queue it
                const email = await Email.create({
                    to: record.vendor.email,
                    subject: `Urgent: Compliance Requirement Expiring in ${days} Days - ${record.requirement.name}`,
                    template: 'compliance_reminder',
                    context: {
                        vendorName: record.vendor.name,
                        requirementName: record.requirement.name,
                        expiryDate: new Date(record.expiryDate).toLocaleDateString(),
                        customMessage: `Your compliance documentation for "${record.requirement.name}" is set to expire in ${days} days. Please upload updated evidence to avoid non-compliance.`,
                        actionUrl: `${process.env.FRONTEND_URL}/documents/upload`
                    },
                    status: 'pending',
                    createdBy: 'system-expiry-worker'
                });

                await emailQueue.add({
                    emailId: email.id,
                    to: email.to,
                    subject: email.subject,
                    template: email.template,
                    context: email.context
                });

                totalRemindersSent++;
            }
        }

        logger.info(`Daily expiry check completed. Sent ${totalRemindersSent} automated reminders.`);
        return { totalRemindersSent };

    } catch (error) {
        logger.error('Error in expiry check worker:', error);
        throw error;
    }
});

// Schedule the job to run daily at midnight
const startWorker = async () => {
    // Remove existing repeatable jobs to avoid duplicates if code restarts many times
    const repeatableJobs = await expiryQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
        await expiryQueue.removeRepeatableByKey(job.key);
    }

    // Add new daily task
    await expiryQueue.add('check-expiries', {}, {
        repeat: { cron: '0 0 * * *' } // Every night at 00:00
    });

    // Optional: Trigger a manual run now if started with a flag
    if (process.argv.includes('--run-now')) {
        await expiryQueue.add('check-expiries', {});
    }

    logger.info('Expiry Check Worker initialized and scheduled.');
};

startWorker();

export default expiryQueue;
