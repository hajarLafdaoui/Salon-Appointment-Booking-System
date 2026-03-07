const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);

    // Save notification record
    await Notification.create({
      user: options.userId, // you'll need to pass userId from controller
      type: 'email',
      subject: options.subject,
      message: options.text,
      sentAt: new Date(),
    });

    return info;
  } catch (error) {
    console.error('Email error:', error);
  }
};

module.exports = { sendEmail };