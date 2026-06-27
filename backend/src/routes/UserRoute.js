const express = require('express');
const router = express.Router();
const {
  createStudent, getAllStudents, getStudent, updateStudent, deleteStudent,
} = require('../controllers/UserController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect, authorizeRoles('admin')); // All user routes: admin only

router.route('/').get(getAllStudents).post(createStudent);
router.route('/:id').get(getStudent).put(updateStudent).delete(deleteStudent);

module.exports = router;