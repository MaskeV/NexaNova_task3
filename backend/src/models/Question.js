const mongoose = require('mongoose');

const questionSchema = new  mongoose.Schema({
    topicId:{
    type: String,
    required: [true, 'Question ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^Q\d{2}$/.test(v);
      },
      message: 'QUestion ID must be in format Q01, Q02, etc.'
    }
},

question_text:{
    type:String,
    required:[true,"Question is required"]
},
question_type:{
    type:String,
    enum:['Objective','Descriptive'],
    default:'Objective'
},
code_snippet:{
  type:String
},
marks:{
    type: Number,
    default:1
},
option:{
    optionId:{
        type:Number,
        ref:'Option'
    }
}

});

module.exports = mongoose.model('Question',questionSchema);