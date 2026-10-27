import Complaint from '../models/Complaint.js';
import AuditLog from '../models/AuditLog.js';
import { ComplaintStatus } from '../services/fsmService.js';

// @desc    Get comprehensive system analytics for Admin Dashboard
// @route   GET /api/analytics
// @access  Private (Admin only)
export const getAnalytics = async (req, res) => {
  try {
    const allComplaints = await Complaint.find().lean();
    const totalComplaints = allComplaints.length;

    if (totalComplaints === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          totalComplaints: 0,
          activeComplaints: 0,
          resolvedComplaints: 0,
          overdueCount: 0,
          slaComplianceRate: 100,
          avgResolutionTimeHours: 0,
          satisfactionAverage: 0,
        },
        byCategory: [],
        byStatus: [],
        byPriority: [],
        byDepartment: [],
        recentActivity: [],
      });
    }

    let activeCount = 0;
    let resolvedCount = 0;
    let overdueCount = 0;
    let slaCompliantCount = 0;
    let totalResolutionHours = 0;
    let ratedComplaintsCount = 0;
    let totalRatingSum = 0;

    const statusCounts = {};
    const categoryCounts = {};
    const priorityCounts = {};
    const deptStats = {};

    const now = new Date();

    allComplaints.forEach((c) => {
      // Status counts
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;

      // Category counts
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;

      // Priority counts
      priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;

      // Department aggregation
      const dept = c.assignedDepartment || 'General Administration';
      if (!deptStats[dept]) {
        deptStats[dept] = { department: dept, total: 0, active: 0, resolved: 0, totalHours: 0 };
      }
      deptStats[dept].total += 1;

      const isResolved =
        c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED;

      if (isResolved) {
        resolvedCount += 1;
        deptStats[dept].resolved += 1;

        // Resolution time
        if (c.resolution && c.resolution.resolvedAt) {
          const resolvedDate = new Date(c.resolution.resolvedAt);
          const createdDate = new Date(c.createdAt);
          const hours = Math.max(0, (resolvedDate - createdDate) / (1000 * 60 * 60));
          totalResolutionHours += hours;
          deptStats[dept].totalHours += hours;

          // SLA compliance
          if (c.slaDeadline && resolvedDate <= new Date(c.slaDeadline)) {
            slaCompliantCount += 1;
          } else {
            overdueCount += 1;
          }
        } else {
          slaCompliantCount += 1;
        }

        // Student feedback rating
        if (c.feedback && c.feedback.rating) {
          ratedComplaintsCount += 1;
          totalRatingSum += c.feedback.rating;
        }
      } else {
        activeCount += 1;
        deptStats[dept].active += 1;

        // Active overdue check
        if (c.slaDeadline && now > new Date(c.slaDeadline)) {
          overdueCount += 1;
        }
      }
    });

    const avgResolutionHours =
      resolvedCount > 0 ? (totalResolutionHours / resolvedCount).toFixed(1) : 0;
    const slaComplianceRate =
      totalComplaints > 0
        ? Math.round(((totalComplaints - overdueCount) / totalComplaints) * 100)
        : 100;
    const avgSatisfaction =
      ratedComplaintsCount > 0 ? (totalRatingSum / ratedComplaintsCount).toFixed(1) : null;

    // Format distributions for frontend charts
    const byStatus = Object.keys(statusCounts).map((key) => ({
      name: key,
      count: statusCounts[key],
    }));

    const byCategory = Object.keys(categoryCounts).map((key) => ({
      name: key,
      count: categoryCounts[key],
    }));

    const byPriority = Object.keys(priorityCounts).map((key) => ({
      name: key,
      count: priorityCounts[key],
    }));

    const byDepartment = Object.values(deptStats).map((d) => ({
      department: d.department,
      total: d.total,
      active: d.active,
      resolved: d.resolved,
      avgHours: d.resolved > 0 ? (d.totalHours / d.resolved).toFixed(1) : 'N/A',
    }));

    // Recent audit activities
    const recentActivity = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      summary: {
        totalComplaints,
        activeComplaints: activeCount,
        resolvedComplaints: resolvedCount,
        overdueCount,
        slaComplianceRate,
        avgResolutionTimeHours: Number(avgResolutionHours),
        satisfactionAverage: avgSatisfaction ? Number(avgSatisfaction) : null,
      },
      byCategory,
      byStatus,
      byPriority,
      byDepartment,
      recentActivity,
    });
  } catch (error) {
    console.error('Analytics computation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate analytics dashboard.',
      error: error.message,
    });
  }
};
