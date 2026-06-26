const mongoose = require('mongoose');

const studentResponseSchema = new mongoose.Schema({
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Attempt ID is required'],
    ref: 'QuizAttempt'
  },
  questionId: {
    type: String,
    required: [true, 'Question ID is required'],
    ref: 'Question'
  },
  selected_option_id: {
    type: mongoose.Schema.Types.ObjectId,   // _id of embedded option inside Question
    default: null
  },
  is_correct: {
    type: Boolean,
    default: false
  },
  nav_status: {
    type: String,
    enum: ['not_attempted', 'attempted', 'currently_viewing'],
    default: 'not_attempted'         // drives red/orange/green panel colors in SRS
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentResponse', studentResponseSchema);