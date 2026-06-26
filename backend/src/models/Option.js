const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  option_text: {                      // was 'otion_text' (typo)
    type: String,
    required: [true, 'Option text is required']
  },
  is_correct: {
    type: Boolean,                    // was 'boolean' (lowercase = undefined in JS)
    default: false
  }
}, { _id: true });

module.exports = optionSchema;        // exported as schema, not model