const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// @desc    Student submits a quiz
// @route   POST /api/results/submit
// @access  Private/Student
// SRS: "Final Submit button" / "Auto-submit on time expiry"
exports.submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers, auto_submitted } = req.body;
    // answers: [{ questionId, selected_option }]

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Prevent duplicate submission
    const existing = await Result.findOne({ student: req.user._id, quiz: quizId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Quiz already submitted' });
    }

    // Fetch all questions to evaluate answers
    const questionIds = quiz.questions.map((q) => q.questionId);
    const questions = await Question.find({ questionId: { $in: questionIds } });

    // Build a map for quick lookup
    const questionMap = {};
    questions.forEach((q) => { questionMap[q.questionId] = q; });

    let marks_obtained = 0;
    const evaluatedAnswers = answers.map((ans) => {
      const question = questionMap[ans.questionId];
      let is_correct = false;

      if (question && question.question_type === 'Objective') {
        const correctOption = question.options.find((o) => o.is_correct);
        if (correctOption && correctOption.optionId === ans.selected_option) {
          is_correct = true;
          marks_obtained += question.marks || 1;
        }
      }
      // Descriptive: is_correct stays false (manual evaluation not in SRS scope)

      return { questionId: ans.questionId, selected_option: ans.selected_option, is_correct };
    });

    const result = await Result.create({
      student: req.user._id,
      quiz: quizId,
      subjectId: quiz.subjectId,
      topicId: quiz.topicId,
      quiz_date: quiz.scheduled_date,
      total_marks: quiz.total_marks,
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

// @desc    Get all results for logged-in student
// @route   GET /api/results/my
// @access  Private/Student
// SRS: "List of all quizzes attempted across subjects and topics"
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
// SRS: "Total quizzes attempted, Average score, Best score"
exports.getMyPerformanceSummary = async (req, res, next) => {
  try {
    const results = await Result.find({ student: req.user._id, status: 'Completed' });

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
      .populate('quiz', 'title');
    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};