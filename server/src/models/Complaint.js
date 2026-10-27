import mongoose from 'mongoose';
import { ComplaintStatus, PriorityLevels, calculateSlaDeadline } from '../services/fsmService.js';

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the complaint'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed complaint description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a complaint category'],
      enum: [
        'Hostel',
        'Classroom',
        'Wi-Fi & Network',
        'Electrical',
        'Plumbing',
        'Housekeeping',
        'Carpentry',
        'Lab & Equipment',
        'Civil & Infrastructure',
        'Other',
      ],
    },
    location: {
      zone: {
        type: String,
        required: true,
        default: 'Central Campus',
      },
      building: {
        type: String,
        required: [true, 'Please provide the building or facility name'],
      },
      roomNumber: {
        type: String,
        required: [true, 'Please provide the room or specific spot'],
      },
    },
    priority: {
      type: String,
      enum: Object.values(PriorityLevels),
      default: PriorityLevels.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.SUBMITTED,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedDepartment: {
      type: String,
      default: 'General Administration',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    resolution: {
      notes: { type: String, default: '' },
      proofImage: { type: String, default: '' },
      resolvedAt: { type: Date, default: null },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: { type: String, default: '' },
      submittedAt: { type: Date, default: null },
    },
    slaDeadline: {
      type: Date,
      required: true,
    },
    timeline: [timelineEntrySchema],
    reopenReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-assign ticketNumber and slaDeadline before initial save
complaintSchema.pre('validate', async function (next) {
  if (this.isNew) {
    if (!this.ticketNumber) {
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      this.ticketNumber = `CF-${datePart}-${randomSeq}`;
    }
    if (!this.slaDeadline) {
      this.slaDeadline = calculateSlaDeadline(this.priority);
    }
  }
  next();
});

// Virtual helper: SLA is breached if not resolved before slaDeadline
complaintSchema.virtual('isOverdue').get(function () {
  if (this.status === ComplaintStatus.RESOLVED || this.status === ComplaintStatus.CLOSED) {
    if (this.resolution && this.resolution.resolvedAt) {
      return this.resolution.resolvedAt > this.slaDeadline;
    }
    return false;
  }
  return new Date() > this.slaDeadline;
});

complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
