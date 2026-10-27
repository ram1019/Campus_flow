import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import {
  ComplaintStatus,
  PriorityLevels,
  validateTransition,
  calculateSlaDeadline,
} from '../services/fsmService.js';

// Helper to notify a user
const createNotification = async ({ recipient, title, message, type, complaintId }) => {
  try {
    if (!recipient) return;
    await Notification.create({
      recipient,
      title,
      message,
      type: type || 'STATUS_CHANGE',
      complaint: complaintId,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Students, Admins)
export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      zone,
      building,
      roomNumber,
      priority = PriorityLevels.MEDIUM,
      assignedDepartment,
    } = req.body;

    if (!title || !description || !category || !building || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, category, building, room).',
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    // Auto-determine suggested department based on category if not provided
    const departmentMap = {
      'Electrical': 'Electrical',
      'Plumbing': 'Plumbing',
      'Wi-Fi & Network': 'IT & Network',
      'Housekeeping': 'Housekeeping',
      'Carpentry': 'Carpentry',
      'Civil & Infrastructure': 'Civil',
      'Hostel': 'General Administration',
      'Classroom': 'General Administration',
      'Lab & Equipment': 'IT & Network',
      'Other': 'General Administration',
    };

    const department = assignedDepartment || departmentMap[category] || 'General Administration';

    const complaint = new Complaint({
      title,
      description,
      category,
      location: {
        zone: zone || 'Central Campus',
        building,
        roomNumber,
      },
      priority,
      status: ComplaintStatus.SUBMITTED,
      createdBy: req.user._id,
      assignedDepartment: department,
      images,
      slaDeadline: calculateSlaDeadline(priority),
      timeline: [
        {
          status: ComplaintStatus.SUBMITTED,
          changedBy: req.user._id,
          note: 'Ticket registered by user.',
          timestamp: new Date(),
        },
      ],
    });

    await complaint.save();

    // Audit log
    await AuditLog.create({
      action: 'COMPLAINT_CREATED',
      performedBy: req.user._id,
      userRole: req.user.role,
      entityId: complaint._id,
      newState: complaint.toObject(),
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        title: 'New Complaint Submitted',
        message: `New ticket ${complaint.ticketNumber} [${complaint.priority}]: "${complaint.title}"`,
        type: 'STATUS_CHANGE',
        complaintId: complaint._id,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting complaint.',
      error: error.message,
    });
  }
};

// @desc    Get complaints list with search, filter, and pagination
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req, res) => {
  try {
    const {
      q,
      status,
      category,
      priority,
      department,
      assignedToMe,
      myComplaintsOnly,
      isOverdue,
      page = 1,
      limit = 25,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Role-based visibility
    if (req.user.role === 'student' || myComplaintsOnly === 'true') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'staff' && assignedToMe === 'true') {
      query.assignedTo = req.user._id;
    }

    // Status filter
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Category filter
    if (category && category !== 'ALL') {
      query.category = category;
    }

    // Priority filter
    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    // Department filter
    if (department && department !== 'ALL') {
      query.assignedDepartment = department;
    }

    // Full-text search across title, description, ticketNumber, building, room
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { ticketNumber: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { 'location.building': searchRegex },
        { 'location.roomNumber': searchRegex },
        { 'location.zone': searchRegex },
      ];
    }

    // Overdue filter
    if (isOverdue === 'true') {
      query.slaDeadline = { $lt: new Date() };
      query.status = { $nin: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [complaints, totalCount] = await Promise.all([
      Complaint.find(query)
        .populate('createdBy', 'name email role hostelOrRoom studentId')
        .populate('assignedTo', 'name email department phone')
        .populate('timeline.changedBy', 'name role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Complaint.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: complaints.length,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      complaints,
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving complaints.',
      error: error.message,
    });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email role hostelOrRoom phone studentId')
      .populate('assignedTo', 'name email department phone')
      .populate('timeline.changedBy', 'name role department')
      .populate('resolution.resolvedBy', 'name department');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // If student, ensure they created it
    if (
      req.user.role === 'student' &&
      complaint.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this complaint.',
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error('Error fetching complaint details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving complaint details.',
      error: error.message,
    });
  }
};

// @desc    Transition complaint status (FSM Enforcement)
// @route   PATCH /api/complaints/:id/status
// @access  Private (Role-enforced by FSM engine)
export const updateStatus = async (req, res) => {
  try {
    const { targetStatus, note, resolutionNotes, reopenReason, rating, feedbackComment } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('createdBy');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const previousStatus = complaint.status;

    // Validate state transition through FSM engine
    const validation = validateTransition({
      currentStatus: previousStatus,
      nextStatus: targetStatus,
      user: req.user,
      complaint,
    });

    if (!validation.allowed) {
      return res.status(400).json({
        success: false,
        message: validation.reason,
        currentStatus: previousStatus,
        attemptedStatus: targetStatus,
      });
    }

    // Process resolution details if transitioning to RESOLVED
    if (targetStatus === ComplaintStatus.RESOLVED) {
      if (!resolutionNotes || resolutionNotes.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Resolution notes are required when marking a complaint as resolved.',
        });
      }

      let proofImage = '';
      if (req.file) {
        proofImage = `/uploads/${req.file.filename}`;
      } else if (req.body.proofImage) {
        proofImage = req.body.proofImage;
      }

      complaint.resolution = {
        notes: resolutionNotes,
        proofImage,
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
      };

      // Notify the student who created the ticket
      await createNotification({
        recipient: complaint.createdBy._id,
        title: 'Issue Resolved — Please Confirm',
        message: `Your complaint "${complaint.title}" (${complaint.ticketNumber}) has been resolved. Please review and close the ticket.`,
        type: 'STATUS_CHANGE',
        complaintId: complaint._id,
      });
    }

    // Process feedback and closing if transitioning to CLOSED
    if (targetStatus === ComplaintStatus.CLOSED) {
      if (rating) {
        const ratingNum = Number(rating);
        if (ratingNum >= 1 && ratingNum <= 5) {
          complaint.feedback = {
            rating: ratingNum,
            comment: feedbackComment || '',
            submittedAt: new Date(),
          };
        }
      }

      // Notify staff/admin that student closed ticket
      if (complaint.assignedTo) {
        await createNotification({
          recipient: complaint.assignedTo,
          title: 'Ticket Closed by Student',
          message: `Ticket ${complaint.ticketNumber} was closed. Rating: ${complaint.feedback?.rating || 'N/A'}/5.`,
          type: 'FEEDBACK',
          complaintId: complaint._id,
        });
      }
    }

    // Process reopen
    if (targetStatus === ComplaintStatus.REOPENED) {
      complaint.reopenReason = reopenReason || note || 'Student reported issue is not resolved.';

      // Notify assigned staff / admins
      if (complaint.assignedTo) {
        await createNotification({
          recipient: complaint.assignedTo,
          title: 'Ticket Reopened!',
          message: `Ticket ${complaint.ticketNumber} has been reopened: "${complaint.reopenReason}"`,
          type: 'STATUS_CHANGE',
          complaintId: complaint._id,
        });
      }
    }

    // Update status and append to timeline
    complaint.status = targetStatus;
    complaint.timeline.push({
      status: targetStatus,
      changedBy: req.user._id,
      note: note || `Status transitioned from ${previousStatus} to ${targetStatus}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Audit Log
    await AuditLog.create({
      action: `STATUS_CHANGE_${previousStatus}_TO_${targetStatus}`,
      performedBy: req.user._id,
      userRole: req.user.role,
      entityId: complaint._id,
      previousState: { status: previousStatus },
      newState: { status: targetStatus, note },
    });

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to ${targetStatus}`,
      complaint,
    });
  } catch (error) {
    console.error('Error transitioning complaint status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating status.',
      error: error.message,
    });
  }
};

// @desc    Assign complaint to department and/or technician
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Admin only)
export const assignComplaint = async (req, res) => {
  try {
    const { assignedDepartment, assignedTo, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (assignedDepartment) {
      complaint.assignedDepartment = assignedDepartment;
    }

    if (assignedTo) {
      const staffUser = await User.findOne({ _id: assignedTo, role: 'staff' });
      if (!staffUser) {
        return res.status(400).json({
          success: false,
          message: 'The selected user is not a valid staff member.',
        });
      }
      complaint.assignedTo = staffUser._id;

      // Notify staff
      await createNotification({
        recipient: staffUser._id,
        title: 'New Complaint Assigned to You',
        message: `You were assigned complaint ${complaint.ticketNumber}: "${complaint.title}"`,
        type: 'ASSIGNED',
        complaintId: complaint._id,
      });
    }

    // If currently SUBMITTED, transition to ASSIGNED automatically
    if (complaint.status === ComplaintStatus.SUBMITTED) {
      complaint.status = ComplaintStatus.ASSIGNED;
    }

    complaint.timeline.push({
      status: complaint.status,
      changedBy: req.user._id,
      note: note || `Assigned to ${complaint.assignedDepartment}${assignedTo ? ' (staff allocated)' : ''}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Audit Log
    await AuditLog.create({
      action: 'COMPLAINT_ASSIGNED',
      performedBy: req.user._id,
      userRole: req.user.role,
      entityId: complaint._id,
      newState: {
        assignedDepartment: complaint.assignedDepartment,
        assignedTo: complaint.assignedTo,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while assigning complaint.',
      error: error.message,
    });
  }
};

// @desc    Submit feedback & star rating on resolved/closed complaint
// @route   POST /api/complaints/:id/feedback
// @access  Private (Student creator)
export const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only ticket creator can submit feedback.' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
    }

    complaint.feedback = {
      rating: Number(rating),
      comment: comment || '',
      submittedAt: new Date(),
    };

    // Close complaint if still in RESOLVED
    if (complaint.status === ComplaintStatus.RESOLVED) {
      complaint.status = ComplaintStatus.CLOSED;
      complaint.timeline.push({
        status: ComplaintStatus.CLOSED,
        changedBy: req.user._id,
        note: `Closed with ${rating} star rating: "${comment || 'No comment'}"`,
        timestamp: new Date(),
      });
    }

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully.',
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error submitting feedback.',
      error: error.message,
    });
  }
};
