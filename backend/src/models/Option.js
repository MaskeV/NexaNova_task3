const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  optionId:{
    type:Number,
    required:[true]
  },
  otion_text:{
    type:String,
    required:[true,"Mention option"],
  },
  is_correct:{
    type:boolean
  }
});

module.exports = mongoose.model('Option',optionSchema);

