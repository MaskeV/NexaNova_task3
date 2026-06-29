const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: [true, 'Quiz ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function (v) {
        return /^QZ\d{2,}$/.test(v);
      },
      message: 'Quiz ID must be in format QZ01, QZ02, etc.'
    }
  },
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  subjectId: {
    type: String,
    required: [true, 'Subject is required'],
    ref: 'Subject'
  },
  topicId: {
    type: String,
    required: [true, 'Topic is required'],
    ref: 'Topic'
  },
  duration_minutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  scheduled_date: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduled_time: {
    type: String,           // stored as "HH:MM" string e.g. "10:30"
    required: [true, 'Scheduled time is required'],
    match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format']
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: {
    type: [{
      questionId: {
        type: String,
        required: true,
        ref: 'Question'
      }
    }],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: compute start_time and end_time from scheduled_date + scheduled_time + duration
quizSchema.virtual('start_time').get(function () {
  if (!this.scheduled_date || !this.scheduled_time) return null;
  const d = new Date(this.scheduled_date);
  const [h, m] = this.scheduled_time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
});

quizSchema.virtual('end_time').get(function () {
  const start = this.start_time;
  if (!start) return null;
  return new Date(start.getTime() + (this.duration_minutes || 30) * 60 * 1000);
});

module.exports = mongoose.model('Quiz', quizSchema);
