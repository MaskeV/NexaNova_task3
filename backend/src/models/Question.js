const mongoose = require('mongoose');
const optionSchema = require('./Option');

const questionSchema = new mongoose.Schema({
  questionId: {                       // was named 'topicId' by mistake
    type: String,
    required: [true, 'Question ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function (v) {
        return /^Q\d{2,}$/.test(v);  // Q01, Q02 ... Q99, Q100
      },
      message: 'Question ID must be in format Q01, Q02, etc.'
    }
  },
  subjectId: {                        // was missing entirely
    type: String,
    required: [true, 'Subject ID is required'],
    ref: 'Subject'
  },
  topicId: {                          // was missing entirely
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
  options: {                          // was broken — now properly embeds optionSchema
    type: [optionSchema],
    validate: {
      validator: function (v) {
        return v.length === 4;        // SRS says exactly 4 options per question
      },
      message: 'A question must have exactly 4 options'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);