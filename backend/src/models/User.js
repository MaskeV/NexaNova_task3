const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'Username is required'],
    minlength: [5, 'Username should be at least 5 characters']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    trim: true,
    minlength: [6, 'Password must be at least 6 characters long'],
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: txrue   // was 'timestamp' (missing s) — this adds createdAt and updatedAt
});

// must use regular function, not arrow — arrow loses 'this' context
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);  // was module.export (missing s)