const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');

// @desc    Student submits a quiz
// @route   POST /api/results/submit
// @access  Private/Student
exports.submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers, auto_submitted } = req.body;

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'quizId and answers array are required',
      });
    }

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const existing = await Result.findOne({
      student: req.user._id,
      quiz: quiz._id,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Quiz already submitted' });
    }

    const questionIds = quiz.questions.map((q) => q.questionId);
    const questions = await Question.find({ questionId: { $in: questionIds } });

    const questionMap = {};
    questions.forEach((q) => { questionMap[q.questionId] = q; });

    const total_marks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    let marks_obtained = 0;

    const evaluatedAnswers = answers.map((ans) => {
      const question = questionMap[ans.questionId];
      let is_correct = false;

      if (question && question.question_type === 'Objective') {
        const correctOption = question.options.find((o) => o.is_correct);
        if (correctOption && correctOption._id.toString() === ans.selected_option) {
          is_correct = true;
          marks_obtained += question.marks || 1;
        }
      }

      return {
        questionId: ans.questionId,
        selected_option: ans.selected_option,
        is_correct,
      };
    });

    const result = await Result.create({
      student: req.user._id,
      quiz: quiz._id,
      subjectId: quiz.subjectId,
      topicId: quiz.topicId,
      quiz_date: quiz.scheduled_date,
      total_marks,
      marks_obtained,
      answers: evaluatedAnswers,
      status: 'Completed',
      submitted_at: new Date(),
      auto_submitted: auto_submitted || false,
    });

    res.status(201).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark missed quizzes for logged-in student
//          Called when student loads their dashboard/results — marks any past quiz
//          they didn't attempt as "Missed"
// @route   POST /api/results/mark-missed
// @access  Private/Student
// SRS: "Status (Completed / Missed)"
exports.markMissedQuizzes = async (req, res, next) => {
  try {
    const now = new Date();

    // Get all past quizzes (scheduled_date before today)
    const allQuizzes = await Quiz.find({ isActive: true });

    // Filter quizzes whose end_time has passed
    const pastQuizzes = allQuizzes.filter((q) => {
      const end = q.end_time; // virtual from model
      return end && end < now;
    });

    if (pastQuizzes.length === 0) {
      return res.status(200).json({ success: true, marked: 0 });
    }

    // Find which ones the student already has a result for
    const quizObjectIds = pastQuizzes.map((q) => q._id);
    const existingResults = await Result.find({
      student: req.user._id,
      quiz: { $in: quizObjectIds },
    }).select('quiz');

    const attemptedQuizIds = new Set(existingResults.map((r) => r.quiz.toString()));

    // Create "Missed" results for ones they haven't attempted
    const missedQuizzes = pastQuizzes.filter((q) => !attemptedQuizIds.has(q._id.toString()));

    let marked = 0;
    for (const quiz of missedQuizzes) {
      const questionIds = quiz.questions.map((q) => q.questionId);
      const questions = await Question.find({ questionId: { $in: questionIds } });
      const total_marks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

      await Result.create({
        student: req.user._id,
        quiz: quiz._id,
        subjectId: quiz.subjectId,
        topicId: quiz.topicId,
        quiz_date: quiz.scheduled_date,
        total_marks,
        marks_obtained: 0,
        answers: [],
        status: 'Missed',
        submitted_at: null,
        auto_submitted: false,
      });
      marked++;
    }

    res.status(200).json({ success: true, marked });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all results for logged-in student
// @route   GET /api/results/my
// @access  Private/Student
exports.getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('quiz', 'title duration_minutes scheduled_date')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall performance summary for logged-in student
// @route   GET /api/results/my/summary
// @access  Private/Student
exports.getMyPerformanceSummary = async (req, res, next) => {
  try {
    const results = await Result.find({
      student: req.user._id,
      status: 'Completed',
    });

    const total_attempted = results.length;

    if (total_attempted === 0) {
      return res.status(200).json({
        success: true,
        summary: { total_attempted: 0, average_score: 0, best_score: 0 },
      });
    }

    const percentages = results.map((r) => r.percentage);
    const average_score = parseFloat(
      (percentages.reduce((a, b) => a + b, 0) / total_attempted).toFixed(2)
    );
    const best_score = Math.max(...percentages);

    res.status(200).json({
      success: true,
      summary: { total_attempted, average_score, best_score },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin gets all results
// @route   GET /api/results
// @access  Private/Admin
exports.getAllResults = async (req, res, next) => {
  try {
    const results = await Result.find()
      .populate('student', 'username email')
      .populate('quiz', 'title scheduled_date');

    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};
