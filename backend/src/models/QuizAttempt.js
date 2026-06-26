const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: [true, 'Quiz ID is required'],
    ref: 'Quiz'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Student ID is required'],
    ref: 'User'
  },
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'missed'],
    default: 'in_progress'
  },
  total_marks: {
    type: Number,
    default: 0
  },
  marks_obtained: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);