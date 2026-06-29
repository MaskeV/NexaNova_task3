const mongoose = require('mongoose');
const optionSchema = require('./Option');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: [true, 'Question ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function (v) {
        return /^Q\d{2,}$/.test(v);
      },
      message: 'Question ID must be in format Q01, Q02, etc.'
    }
  },
  subjectId: {
    type: String,
    required: [true, 'Subject ID is required'],
    ref: 'Subject'
  },
  topicId: {
    type: String,
    required: [true, 'Topic ID is required'],
    ref: 'Topic'
  },
  question_text: {
    type: String,
    required: [true, 'Question text is required']
  },
  question_type: {
    type: String,
    enum: ['Objective', 'Descriptive'],
    default: 'Objective'
  },
  code_snippet: {
    type: String,
    default: null
  },
  marks: {
    type: Number,
    default: 1
  },
  options: {
    type: [optionSchema],
    default: [],
    validate: {
      validator: function (v) {
        // Descriptive questions don't need options
        if (this.question_type === 'Descriptive') return true;
        // Objective questions must have exactly 4 options
        return v.length === 4;
      },
      message: 'Objective questions must have exactly 4 options'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
