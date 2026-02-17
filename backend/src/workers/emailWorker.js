import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createModuleLogger } from '../utils/loggerFactory.js';
import emailQueue from '../config/emailQueue.js';
import { Email } from '../models/index.js';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { promises as fs } from 'fs';
import Handlebars from 'handlebars';

// Load environment variables - search in parent directories for .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const logger = createModuleLogger(import.meta.url);

logger.info('Email worker started');

// Process email jobs
emailQueue.process(async (job) => {
    const { emailId, to, subject, template, context } = job.data;

    // Get email provider configuration
    const provider = process.env.EMAIL_PROVIDER;
    const emailFrom = process.env.EMAIL_FROM;

    try {
        // Update email status to processing
        await Email.update({
            status: 'processing',
            attempts: job.attemptsMade + 1
        }, {
            where: { id: emailId }
        });

        let messageId;

        // Render the email template
        const html = await renderTemplate(template, context);

        // Send email based on provider
        if (provider === 'sendgrid') {
            messageId = await sendWithSendgrid(to, emailFrom, subject, html);
        } else {
            messageId = await sendWithSMTP(to, emailFrom, subject, html);
        }

        // Mark email as sent
        await Email.update({
            status: 'sent',
            messageId: messageId,
            sentAt: new Date(),
            context: context
        }, {
            where: { id: emailId }
        });

        logger.info('Email sent successfully', { emailId, messageId });
        return { messageId };

    } catch (error) {
        const status = job.attemptsMade >= 2 ? 'failed' : 'retrying';
        
        await Email.update({
            status: status,
            error: error.message,
            attempts: job.attemptsMade + 1
        }, {
            where: { id: emailId }
        });

        logger.error('Failed to send email', {
            emailId,
            error: error.message,
            attempt: job.attemptsMade + 1
        });

        throw error;
    }
});

// Helper function for SendGrid
// Render email template
async function renderTemplate(templateName, context) {
    try {
        const templatePath = path.join(process.cwd(), 'src/templates/email', `${templateName}.hbs`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = Handlebars.compile(templateContent);
        return template(context);
    } catch (error) {
        logger.error('Template rendering error:', error);
        throw error;
    }
}

// Helper function for SendGrid
async function sendWithSendgrid(to, from, subject, html) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to,
        from,
        subject,
        html
    };

    const [response] = await sgMail.send(msg);
    return response?.headers?.['x-message-id'] || 'sendgrid-no-id';
}

// Helper function for SMTP
async function sendWithSMTP(to, from, subject, html) {
    const transporter = nodemailer.createTransport({
        host: process.env.MAILSERVER_HOST,
        port: Number(process.env.MAILSERVER_PORT),
        auth: {
            user: process.env.MAILSERVER_USER,
            pass: process.env.MAILSERVER_PASS
        }
    });

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        html
    });

    return info.messageId;
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    logger.info('Shutting down email worker...');
    await emailQueue.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('Shutting down email worker...');
    await emailQueue.close();
    process.exit(0);
});

// Log any unhandled errors
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled rejection in email worker', { error: error.message });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception in email worker', { error: error.message });
    process.exit(1);
});