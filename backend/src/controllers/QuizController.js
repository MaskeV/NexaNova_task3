const Quiz = require('../models/Quiz');

// @desc    Admin creates a quiz
// @route   POST /api/quizzes
// @access  Private/Admin
exports.createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create({ ...req.body, created_by: req.user._id });
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quizzes (admin view)
// @route   GET /api/quizzes
// @access  Private/Admin
exports.getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().populate('created_by', 'username email');
    res.status(200).json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quizzes scheduled for TODAY (student dashboard)
// @route   GET /api/quizzes/today
// @access  Private/Student
// SRS: "View quizzes scheduled for the current day"
exports.getTodaysQuizzes = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const quizzes = await Quiz.find({
      scheduled_date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
    });

    res.status(200).json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz (with questions for attempting)
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.id });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // SRS: "Quiz accessible only on scheduled date and time"
    if (req.user.role === 'student') {
      const now = new Date();
      const start = new Date(quiz.start_time);
      const end = new Date(quiz.end_time);

      if (now < start || now > end) {
        return res.status(403).json({
          success: false,
          message: 'Quiz is not accessible at this time',
        });
      }
    }

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndUpdate({ quizId: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ quizId: req.params.id });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.status(200).json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    next(error);
  }
};