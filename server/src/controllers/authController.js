import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, hostelOrRoom, phone, studentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Role restrictions: regular registration is student; staff/admin can be seeded or selected for demo
    const assignedRole = role && ['student', 'staff', 'admin'].includes(role) ? role : 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      department: assignedRole === 'staff' ? (department || 'General Administration') : 'None',
      hostelOrRoom: hostelOrRoom || '',
      phone: phone || '',
      studentId: studentId || '',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        hostelOrRoom: user.hostelOrRoom,
        phone: user.phone,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        hostelOrRoom: user.hostelOrRoom,
        phone: user.phone,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile.',
      error: error.message,
    });
  }
};

// @desc    Get all staff members (for assignment dropdown)
// @route   GET /api/auth/staff
// @access  Private (Staff or Admin)
export const getStaffUsers = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('name email department phone');
    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving staff users.',
      error: error.message,
    });
  }
};
