const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email: 'student1@gmail.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }

  await User.create({
    username: 'studentq',
    email: 'student1@gmail.com',
    password: 'Student@123',
    role: 'student',
  });

  console.log('Success');
  process.exit();
};

seed().catch((err) => { console.error(err); process.exit(1); });