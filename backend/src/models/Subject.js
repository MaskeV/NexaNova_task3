const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    required: [true, 'Subject ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function (v) {
        return /^SB\d{2,}$/.test(v);
      },
      message: 'Subject ID must be in format SB01, SB02, etc.'
    }
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    minlength: [3, 'Subject name must be at least 3 characters'],
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  topics: {
    type: [{
      topicId: {
        type: String,
        required: true,
        ref: 'Topic'
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);