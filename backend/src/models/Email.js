import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Email = sequelize.define("Email", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for email records'
    },
    toAddress: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'to_address'
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    template: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    context: {
        type: DataTypes.JSON,
        allowNull: true
    },
    renderedContent: {
        type: DataTypes.TEXT('MEDIUM'),
        allowNull: true,
        field: 'rendered_content'
    },
    status: {
        type: DataTypes.ENUM('queued', 'processing', 'sent', 'failed', 'retrying'),
        defaultValue: 'queued'
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    messageId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'message_id'
    },
    jobId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'job_id'
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'sent_at'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'emails',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
        {
            name: 'idx_status',
            fields: ['status']
        },
        {
            name: 'idx_job_id',
            fields: ['job_id']
        }
    ]
});

export default Email;