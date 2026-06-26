const User = require('../models/User');

// @desc    Admin creates a student account
// @route   POST /api/users
// @access  Private/Admin
exports.createStudent = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({ username, email, password, role: 'student' });

    res.status(201).json({
      success: true,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/users
// @access  Private/Admin
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' });
    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getStudent = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin updates student (activate/deactivate, reset password)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateStudent = async (req, res, next) => {
  try {
    const { username, email, isActive, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (password) user.password = password; // pre('save') hook hashes it

    await user.save();
    res.status(200).json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};