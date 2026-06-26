const Subject = require('../models/Subject');

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private/Admin
exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
exports.getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ subjectId: req.params.id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { subjectId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ subjectId: req.params.id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add topic reference to subject
// @route   POST /api/subjects/:id/topics
// @access  Private/Admin
exports.addTopicToSubject = async (req, res, next) => {
  try {
    const { topicId, order } = req.body;
    const subject = await Subject.findOne({ subjectId: req.params.id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    // Prevent duplicates
    const exists = subject.topics.some((t) => t.topicId === topicId);
    if (exists) return res.status(400).json({ success: false, message: 'Topic already added' });

    subject.topics.push({ topicId, order });
    await subject.save();

    res.status(200).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};