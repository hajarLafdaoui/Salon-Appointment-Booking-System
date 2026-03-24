const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected');

    const adminEmail = 'admin@beautyglow.com';
    const adminPassword = 'admin123';

    // Remove existing admin if it exists
    await User.findOneAndDelete({ email: adminEmail });

    // Create a NEW admin (the pre-save hook in User.js will hash the password correctly)
    const admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log('-----------------------------------');
    console.log('Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

resetAdmin();
