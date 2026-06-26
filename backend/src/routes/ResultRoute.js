const express = require('express');
const router = express.Router();
const {
  submitQuiz, getMyResults, getMyPerformanceSummary, getAllResults,
} = require('../controllers/resultController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.post('/submit', authorizeRoles('student'), submitQuiz);
router.get('/my', authorizeRoles('student'), getMyResults);
router.get('/my/summary', authorizeRoles('student'), getMyPerformanceSummary);
router.get('/', authorizeRoles('admin'), getAllResults);

module.exports = router;