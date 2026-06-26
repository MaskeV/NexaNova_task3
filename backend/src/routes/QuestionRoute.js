const express = require('express');
const router = express.Router();
const {
  createQuestion, getAllQuestions, getQuestion, updateQuestion, deleteQuestion,
} = require('../controllers/questionController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(authorizeRoles('admin'), getAllQuestions)
  .post(authorizeRoles('admin'), createQuestion);

router.route('/:id')
  .get(getQuestion)
  .put(authorizeRoles('admin'), updateQuestion)
  .delete(authorizeRoles('admin'), deleteQuestion);

module.exports = router;