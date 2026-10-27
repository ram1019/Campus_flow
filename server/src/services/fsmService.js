/**
 * CampusFlow Complaint State Machine (FSM)
 * Enforces valid state transitions and role-based permissions.
 */

export const ComplaintStatus = {
  SUBMITTED: 'SUBMITTED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
};

export const PriorityLevels = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

// SLA resolution targets in hours
export const SLA_HOURS = {
  [PriorityLevels.CRITICAL]: 12,
  [PriorityLevels.HIGH]: 24,
  [PriorityLevels.MEDIUM]: 48,
  [PriorityLevels.LOW]: 72,
};

/**
 * Valid transitions matrix:
 * SourceStatus -> Array of target status configs:
 * { target: TargetStatus, allowedRoles: ['admin', 'staff', 'student'], requiresAssignment?: boolean }
 */
const TRANSITION_RULES = {
  [ComplaintStatus.SUBMITTED]: [
    { target: ComplaintStatus.ASSIGNED, roles: ['admin', 'staff'] },
    { target: ComplaintStatus.IN_PROGRESS, roles: ['admin', 'staff'] },
  ],
  [ComplaintStatus.ASSIGNED]: [
    { target: ComplaintStatus.IN_PROGRESS, roles: ['admin', 'staff'] },
    { target: ComplaintStatus.ASSIGNED, roles: ['admin'] }, // Reassignment
    { target: ComplaintStatus.RESOLVED, roles: ['admin', 'staff'] },
  ],
  [ComplaintStatus.IN_PROGRESS]: [
    { target: ComplaintStatus.RESOLVED, roles: ['admin', 'staff'] },
    { target: ComplaintStatus.ASSIGNED, roles: ['admin'] }, // Return/reassign
  ],
  [ComplaintStatus.RESOLVED]: [
    { target: ComplaintStatus.CLOSED, roles: ['student', 'admin'] }, // Student confirms resolution
    { target: ComplaintStatus.REOPENED, roles: ['student', 'admin'] }, // Student unsatisfied
  ],
  [ComplaintStatus.CLOSED]: [
    { target: ComplaintStatus.REOPENED, roles: ['student', 'admin'] },
  ],
  [ComplaintStatus.REOPENED]: [
    { target: ComplaintStatus.ASSIGNED, roles: ['admin', 'staff'] },
    { target: ComplaintStatus.IN_PROGRESS, roles: ['admin', 'staff'] },
  ],
};

/**
 * Validates whether a state transition is legal for the given user role and context.
 * @param {Object} params
 * @param {string} params.currentStatus
 * @param {string} params.nextStatus
 * @param {Object} params.user - { id, role, department }
 * @param {Object} params.complaint - current complaint document
 * @returns {{ allowed: boolean, reason?: string }}
 */
export const validateTransition = ({ currentStatus, nextStatus, user, complaint }) => {
  if (currentStatus === nextStatus) {
    return { allowed: false, reason: `Complaint is already in status '${currentStatus}'` };
  }

  const possibleTransitions = TRANSITION_RULES[currentStatus];
  if (!possibleTransitions) {
    return { allowed: false, reason: `Unknown current status '${currentStatus}'` };
  }

  const rule = possibleTransitions.find((t) => t.target === nextStatus);
  if (!rule) {
    return {
      allowed: false,
      reason: `Illegal state transition: Cannot change status from '${currentStatus}' to '${nextStatus}'.`,
    };
  }

  // Check role authorization
  if (!rule.roles.includes(user.role)) {
    return {
      allowed: false,
      reason: `Access Denied: Users with role '${user.role}' are not permitted to transition tickets from '${currentStatus}' to '${nextStatus}'.`,
    };
  }

  // If student is closing or reopening, ensure they are the creator or an admin
  if (user.role === 'student') {
    const isOwner =
      complaint.createdBy._id?.toString() === user._id.toString() ||
      complaint.createdBy.toString() === user._id.toString();

    if (!isOwner) {
      return {
        allowed: false,
        reason: 'Students can only close or reopen their own complaints.',
      };
    }
  }

  // If staff is transitioning, ensure they belong to the appropriate department or are assigned
  if (user.role === 'staff') {
    const isAssigned =
      complaint.assignedTo &&
      (complaint.assignedTo._id?.toString() === user._id.toString() ||
        complaint.assignedTo.toString() === user._id.toString());

    const isSameDept =
      complaint.assignedDepartment &&
      complaint.assignedDepartment.toLowerCase() === (user.department || '').toLowerCase();

    // Staff can work on complaints assigned to them or within their department
    if (!isAssigned && !isSameDept && complaint.assignedDepartment !== 'General Administration') {
      return {
        allowed: false,
        reason: `Staff can only update complaints within their department (${user.department}) or assigned to them.`,
      };
    }
  }

  return { allowed: true };
};

/**
 * Calculates the SLA deadline timestamp based on ticket creation time and priority.
 */
export const calculateSlaDeadline = (priority, createdAt = new Date()) => {
  const hours = SLA_HOURS[priority] || 48;
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};
