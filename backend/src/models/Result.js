const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required'],
    },
    // Snapshot fields — stored so result remains accurate even if quiz is edited later
    subjectId: {
      type: String,
      ref: 'Subject',
      required: true,
    },
    topicId: {
      type: String,
      ref: 'Topic',
      required: true,
    },
    quiz_date: {
      type: Date,
      required: true,
    },
    total_marks: {
      type: Number,
      required: true,
    },
    marks_obtained: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Completed', 'Missed'],
      default: 'Missed',
    },
    // Per-question answer record
    answers: [
      {
        questionId: { type: String, ref: 'Question' },
        selected_option: { type: String, default: null }, // FIX: was Number, should be String (option _id)
        is_correct: { type: Boolean, default: false },
      },
    ],
    submitted_at: {
      type: Date,
      default: null,
    },
    auto_submitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-calculate percentage before saving
resultSchema.pre('save', function () {
  if (this.total_marks > 0) {
    this.percentage = parseFloat(
      ((this.marks_obtained / this.total_marks) * 100).toFixed(2)
    );
  }
});

module.exports = mongoose.model('Result', resultSchema);