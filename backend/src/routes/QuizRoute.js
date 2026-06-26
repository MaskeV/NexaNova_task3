const express = require('express');
const router = express.Router();
const {
  createQuiz, getAllQuizzes, getTodaysQuizzes, getQuiz, updateQuiz, deleteQuiz,
} = require('../controllers/quizController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

// Student: today's quizzes (must be before /:id to avoid conflict)
router.get('/today', authorizeRoles('student'), getTodaysQuizzes);

router.route('/')
  .get(authorizeRoles('admin'), getAllQuizzes)
  .post(authorizeRoles('admin'), createQuiz);

router.route('/:id')
  .get(getQuiz)
  .put(authorizeRoles('admin'), updateQuiz)
  .delete(authorizeRoles('admin'), deleteQuiz);

module.exports = router;