require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists, updating password...');
    existing.password = process.env.ADMIN_PASSWORD;
    await existing.save();
    console.log('Password updated for:', existing.email);
  } else {
    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    console.log('Admin created:', admin.email);
  }
  await mongoose.disconnect();
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
