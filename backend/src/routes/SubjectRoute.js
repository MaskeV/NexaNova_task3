const express = require('express');
const router = express.Router();
const {
  createSubject, getAllSubjects, getSubject, updateSubject, deleteSubject, addTopicToSubject,
} = require('../controllers/subjectController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect); // All routes require login

router.route('/')
  .get(getAllSubjects)
  .post(authorizeRoles('admin'), createSubject);

router.route('/:id')
  .get(getSubject)
  .put(authorizeRoles('admin'), updateSubject)
  .delete(authorizeRoles('admin'), deleteSubject);

router.post('/:id/topics', authorizeRoles('admin'), addTopicToSubject);

module.exports = router;