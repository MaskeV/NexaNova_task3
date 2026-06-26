const Question = require('../models/Question');

// @desc    Create question
// @route   POST /api/questions
// @access  Private/Admin
exports.createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all questions (optionally filter by type)
// @route   GET /api/questions?type=Objective
// @access  Private/Admin
exports.getAllQuestions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.question_type = req.query.type;

    const questions = await Question.find(filter);
    res.status(200).json({ success: true, count: questions.length, questions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findOne({ questionId: req.params.id });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.status(200).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findOneAndUpdate(
      { questionId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.status(200).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findOneAndDelete({ questionId: req.params.id });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};