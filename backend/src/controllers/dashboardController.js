import { Vendor, VendorCompliance, ComplianceRequirement, Document, Company, User } from '../models/index.js';
import { Sequelize, Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
    try {
        const { companyId, vendorId } = req.user;
        const role = req.user.role?.toLowerCase();

        // Analytics for Super Admin (Infrastructure level)
        if (role === 'super_admin') {
            const totalCompanies = await Company.count();
            const totalAdmins = await User.count({ where: { role: 'admin' } });
            const totalVendorsGlobal = await Vendor.count();

            const recentCompanies = await Company.findAll({
                order: [['createdAt', 'DESC']],
                limit: 5
            });

            return res.json({
                overview: {
                    totalCompanies,
                    totalAdmins,
                    totalVendors: totalVendorsGlobal,
                },
                recentCompanies: recentCompanies.map(c => ({
                    id: c.id,
                    name: c.name,
                    plan: c.plan || 'Standard',
                    status: c.status || 'Active',
                    date: c.createdAt
                }))
            });
        }

        // Analytics for Admin/Company level
        if (role === 'admin') {
            // 1. Total Metrics
            const totalVendors = await Vendor.count({ where: { companyId } });
            const totalReviewsPending = await Document.count({
                include: [{
                    model: VendorCompliance,
                    as: 'compliance',
                    where: { companyId }
                }],
                where: { status: 'pending_review' }
            });

            // 2. Compliance Status Breakdown
            const statusBreakdown = await VendorCompliance.findAll({
                where: { companyId },
                attributes: [
                    'status',
                    [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
                ],
                group: ['status']
            });

            // 3. Recent Activity (Latest 5 document uploads)
            const recentActivity = await Document.findAll({
                include: [{
                    model: VendorCompliance,
                    as: 'compliance',
                    where: { companyId },
                    include: [
                        { model: Vendor, as: 'vendor', attributes: ['name'] },
                        { model: ComplianceRequirement, as: 'requirement', attributes: ['name'] }
                    ]
                }],
                order: [['createdAt', 'DESC']],
                limit: 5
            });

            // 4. Compliance History (Aggregated counts for chart - last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const timeline = await VendorCompliance.findAll({
                where: {
                    companyId,
                    updatedAt: { [Op.gte]: sevenDaysAgo }
                },
                attributes: [
                    [Sequelize.fn('DATE', Sequelize.col('updatedAt')), 'date'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ],
                group: [Sequelize.fn('DATE', Sequelize.col('updatedAt'))],
                order: [[Sequelize.fn('DATE', Sequelize.col('updatedAt')), 'ASC']]
            });

            return res.json({
                overview: {
                    totalVendors,
                    pendingReviews: totalReviewsPending,
                    statusBreakdown: statusBreakdown.reduce((acc, curr) => {
                        acc[curr.status] = parseInt(curr.get('count'));
                        return acc;
                    }, {}),
                },
                recentActivity: recentActivity.map(doc => ({
                    id: doc.id,
                    vendor: doc.compliance.vendor.name,
                    requirement: doc.compliance.requirement.name,
                    status: doc.status,
                    date: doc.createdAt
                })),
                timeline: timeline.map(t => ({
                    date: t.get('date'),
                    count: parseInt(t.get('count'))
                }))
            });
        }

        // Metrics for Vendor
        if (role === 'vendor') {
            const complianceStats = await VendorCompliance.findAll({
                where: { vendorId },
                attributes: [
                    'status',
                    [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
                ],
                group: ['status']
            });

            const upcomingExpiries = await VendorCompliance.findAll({
                where: {
                    vendorId,
                    expiryDate: { [Op.ne]: null },
                    status: 'compliant'
                },
                include: [{ model: ComplianceRequirement, as: 'requirement', attributes: ['name'] }],
                order: [['expiryDate', 'ASC']],
                limit: 5
            });

            return res.json({
                overview: {
                    statusBreakdown: complianceStats.reduce((acc, curr) => {
                        acc[curr.status] = parseInt(curr.get('count'));
                        return acc;
                    }, {}),
                    upcomingExpiries: upcomingExpiries.map(e => ({
                        requirement: e.requirement.name,
                        expiryDate: e.expiryDate
                    }))
                }
            });
        }

        res.status(403).json({ message: "Invalid role access" });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Error fetching dashboard data" });
    }
};
