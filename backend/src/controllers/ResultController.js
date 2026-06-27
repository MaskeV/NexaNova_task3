const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// @desc    Student submits a quiz
// @route   POST /api/results/submit
// @access  Private/Student
exports.submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers, auto_submitted } = req.body;
    // answers: [{ questionId, selected_option }]
    // questionId  — your custom string e.g. "Q01"
    // selected_option — the option's _id (string) from the question fetch

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'quizId and answers array are required',
      });
    }

    // FIX 1: use findOne with custom quizId string, not findById
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // FIX 2: use quiz._id (ObjectId) for Result references
    const existing = await Result.findOne({
      student: req.user._id,
      quiz: quiz._id,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Quiz already submitted' });
    }

    // Fetch all questions for this quiz using custom questionId strings
    const questionIds = quiz.questions.map((q) => q.questionId);
    const questions = await Question.find({ questionId: { $in: questionIds } });

    // Build lookup map: "Q01" -> question document
    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q.questionId] = q;
    });

    // Calculate total marks from all questions
    const total_marks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    let marks_obtained = 0;

    const evaluatedAnswers = answers.map((ans) => {
      const question = questionMap[ans.questionId];
      let is_correct = false;

      if (question && question.question_type === 'Objective') {
        const correctOption = question.options.find((o) => o.is_correct);

        // FIX 3: compare using _id.toString() — Option schema has _id, not optionId
        if (
          correctOption &&
          correctOption._id.toString() === ans.selected_option
        ) {
          is_correct = true;
          marks_obtained += question.marks || 1;
        }
      }
      // Descriptive questions: is_correct stays false (manual evaluation out of scope)

      return {
        questionId: ans.questionId,
        selected_option: ans.selected_option,
        is_correct,
      };
    });

    const result = await Result.create({
      student: req.user._id,
      quiz: quiz._id,              // FIX 2: ObjectId, not the string "QZ01"
      subjectId: quiz.subjectId,
      topicId: quiz.topicId,
      quiz_date: quiz.scheduled_date,
      total_marks,                 // FIX 4: computed above, not from quiz.total_marks (field doesn't exist)
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