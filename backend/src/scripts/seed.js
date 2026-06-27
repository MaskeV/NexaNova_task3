const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email: 'admin@gmail.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }

  await User.create({
    username: 'adminuser',
    email: 'admin@gmail.com',
    password: 'admin@123',
    role: 'admin',
  });

  console.log('Admin created — email: admin@quiz.com  password: admin123');
  process.exit();
};

seed().catch((err) => { console.error(err); process.exit(1); });