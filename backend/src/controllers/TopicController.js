const Topic = require('../models/Topic');

// @desc    Create topic
// @route   POST /api/topics
// @access  Private/Admin
exports.createTopic = async (req, res, next) => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all topics
// @route   GET /api/topics
// @access  Private
exports.getAllTopics = async (req, res, next) => {
  try {
    const topics = await Topic.find();
    res.status(200).json({ success: true, count: topics.length, topics });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single topic
// @route   GET /api/topics/:id
// @access  Private
exports.getTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOne({ topicId: req.params.id });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.status(200).json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private/Admin
exports.updateTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { topicId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.status(200).json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private/Admin
exports.deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndDelete({ topicId: req.params.id });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.status(200).json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add question reference to topic
// @route   POST /api/topics/:id/questions
// @access  Private/Admin
exports.addQuestionToTopic = async (req, res, next) => {
  try {
    const { questionId, order } = req.body;
    const topic = await Topic.findOne({ topicId: req.params.id });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const exists = topic.questions.some((q) => q.questionId === questionId);
    if (exists) return res.status(400).json({ success: false, message: 'Question already added' });

    topic.questions.push({ questionId, order });
    await topic.save();

    res.status(200).json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};