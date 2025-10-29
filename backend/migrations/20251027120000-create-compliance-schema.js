'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Create ComplianceCategories table
    await queryInterface.createTable('ComplianceCategories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // Create ComplianceRequirements table
    await queryInterface.createTable('ComplianceRequirements', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ComplianceCategories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      frequency: {
        type: Sequelize.ENUM('one-time', 'annual', 'semi-annual', 'quarterly', 'monthly'),
        allowNull: false,
        defaultValue: 'annual'
      },
      defaultDueDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      renewalPeriodMonths: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Number of months until renewal is required'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // Create VendorCompliance table
    await queryInterface.createTable('VendorCompliance', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      vendorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Vendors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      requirementId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ComplianceRequirements',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('compliant', 'non-compliant', 'pending', 'expired', 'not-applicable'),
        defaultValue: 'pending',
        allowNull: false
      },
      complianceDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when compliance was achieved'
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when compliance expires'
      },
      nextDueDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Next compliance check/review date'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      documentUrls: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of document URLs for compliance evidence'
      },
      assignedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'User who assigned this requirement'
      },
      reviewedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'User who last reviewed this compliance'
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

    // Add indexes for better performance
    await queryInterface.addIndex('ComplianceCategories', ['isActive'], {
      name: 'compliance_categories_is_active_index'
    });

    await queryInterface.addIndex('ComplianceRequirements', ['categoryId'], {
      name: 'compliance_requirements_category_id_index'
    });

    await queryInterface.addIndex('ComplianceRequirements', ['isActive'], {
      name: 'compliance_requirements_is_active_index'
    });

    await queryInterface.addIndex('ComplianceRequirements', ['frequency'], {
      name: 'compliance_requirements_frequency_index'
    });

    await queryInterface.addIndex('VendorCompliance', ['vendorId'], {
      name: 'vendor_compliance_vendor_id_index'
    });

    await queryInterface.addIndex('VendorCompliance', ['requirementId'], {
      name: 'vendor_compliance_requirement_id_index'
    });

    await queryInterface.addIndex('VendorCompliance', ['status'], {
      name: 'vendor_compliance_status_index'
    });

    await queryInterface.addIndex('VendorCompliance', ['expiryDate'], {
      name: 'vendor_compliance_expiry_date_index'
    });

    await queryInterface.addIndex('VendorCompliance', ['nextDueDate'], {
      name: 'vendor_compliance_next_due_date_index'
    });

    // Add unique constraint to prevent duplicate vendor-requirement assignments
    await queryInterface.addIndex('VendorCompliance', ['vendorId', 'requirementId'], {
      name: 'vendor_compliance_vendor_requirement_unique',
      unique: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Drop tables in reverse order due to foreign key constraints
    await queryInterface.dropTable('VendorCompliance');
    await queryInterface.dropTable('ComplianceRequirements');
    await queryInterface.dropTable('ComplianceCategories');
  }
};