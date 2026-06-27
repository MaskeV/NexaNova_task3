const express = require('express');
const router = express.Router();
const {
  createTopic, getAllTopics, getTopic, updateTopic, deleteTopic, addQuestionToTopic,
} = require('../controllers/TopicController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAllTopics)
  .post(authorizeRoles('admin'), createTopic);

router.route('/:id')
  .get(getTopic)
  .put(authorizeRoles('admin'), updateTopic)
  .delete(authorizeRoles('admin'), deleteTopic);

router.post('/:id/questions', authorizeRoles('admin'), addQuestionToTopic);

module.exports = router;