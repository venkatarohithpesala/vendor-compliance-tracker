'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Create Companies table
    await queryInterface.createTable('Companies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('super_admin', 'admin', 'staff', 'vendor'),
        defaultValue: 'vendor',
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      inviteToken: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'invite_token'
      },
      inviteExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'invite_expires'
      },
      inviteStatus: {
        type: Sequelize.ENUM('pending', 'accepted', 'expired'),
        allowNull: true,
        field: 'invite_status'
      },
      passwordResetRequired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'password_reset_required'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Vendors table
    await queryInterface.createTable('Vendors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: false
      },
      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Emails table
    await queryInterface.createTable('emails', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Primary key for email records'
      },
      toAddress: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'to_address'
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      template: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      context: {
        type: Sequelize.JSON,
        allowNull: true
      },
      renderedContent: {
        type: Sequelize.TEXT('MEDIUM'),
        allowNull: true,
        field: 'rendered_content'
      },
      status: {
        type: Sequelize.ENUM('queued', 'processing', 'sent', 'failed', 'retrying'),
        defaultValue: 'queued',
        allowNull: false
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      messageId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'message_id'
      },
      jobId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'job_id'
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'sent_at'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    });

    // Add indexes
    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });

    await queryInterface.addIndex('Users', ['companyId'], {
      name: 'users_company_id_index'
    });

    await queryInterface.addIndex('Vendors', ['companyId'], {
      name: 'vendors_company_id_index'
    });

    await queryInterface.addIndex('Vendors', ['status'], {
      name: 'vendors_status_index'
    });

    await queryInterface.addIndex('Vendors', ['createdBy'], {
      name: 'vendors_created_by_index'
    });

    await queryInterface.addIndex('emails', ['status'], {
      name: 'idx_status'
    });

    await queryInterface.addIndex('emails', ['job_id'], {
      name: 'idx_job_id'
    });
  },

  async down (queryInterface, Sequelize) {
    // Drop tables in reverse order (due to foreign keys)
    await queryInterface.dropTable('emails');
    await queryInterface.dropTable('Vendors');
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('Companies');
  }
};
