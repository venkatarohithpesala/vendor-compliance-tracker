'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AccessRequests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
      },
      reviewedBy: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'reviewed_by',
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'reviewed_at',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('AccessRequests', ['email'], {
      name: 'access_requests_email_index',
    });

    await queryInterface.addIndex('AccessRequests', ['status'], {
      name: 'access_requests_status_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('AccessRequests');
  },
};
