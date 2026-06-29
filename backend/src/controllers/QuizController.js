const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

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

// @desc    Get quizzes scheduled for TODAY that the student hasn't attempted yet
// @route   GET /api/quizzes/today
// @access  Private/Student
// SRS: "View quizzes scheduled for the current day"
exports.getTodaysQuizzes = async (req, res, next) => {
  try {
    // FIX: use separate Date objects to avoid mutation bug
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const quizzes = await Quiz.find({
      scheduled_date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
    });

    // SRS: student should only see quizzes they haven't already submitted
    const quizObjectIds = quizzes.map((q) => q._id);
    const attempted = await Result.find({
      student: req.user._id,
      quiz: { $in: quizObjectIds },
      status: 'Completed',
    }).select('quiz');

    const attemptedSet = new Set(attempted.map((r) => r.quiz.toString()));
    const available = quizzes.filter((q) => !attemptedSet.has(q._id.toString()));

    res.status(200).json({ success: true, count: available.length, quizzes: available });
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

      // Prevent re-submission: check if student already completed this quiz
      const existing = await Result.findOne({
        student: req.user._id,
        quiz: quiz._id,
        status: 'Completed',
      });
      if (existing) {
        return res.status(403).json({
          success: false,
          message: 'You have already submitted this quiz',
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
