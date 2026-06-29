const express = require('express');
const router = express.Router();
const {
  submitQuiz, markMissedQuizzes, getMyResults, getMyPerformanceSummary, getAllResults,
} = require('../controllers/ResultController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.post('/submit', authorizeRoles('student'), submitQuiz);
router.post('/mark-missed', authorizeRoles('student'), markMissedQuizzes);
router.get('/my', authorizeRoles('student'), getMyResults);
router.get('/my/summary', authorizeRoles('student'), getMyPerformanceSummary);
router.get('/', authorizeRoles('admin'), getAllResults);

module.exports = router;
