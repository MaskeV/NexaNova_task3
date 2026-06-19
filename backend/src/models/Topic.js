const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    topicId:{
    type: String,
    required: [true, 'Topic ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^T\d{2}$/.test(v);
      },
      message: 'Topic ID must be in format T01, T02, etc.'
    }
    },
    name: {
    type: String,
    required: [true, 'Topic name is required'],
    trim: true,
    minlength: [3, 'Topic name must be at least 3 characters'],
    maxlength: [100, 'Topic name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  question:{
    type:[{
        questionId:{
            type:String,
            required:true,
            ref:'Questions'
        },
        order:{
            type: Number,
            default:0
        }
    }],
    default: []
  }
  
})

module.exports = mongoose.model('Topic',topicSchema)