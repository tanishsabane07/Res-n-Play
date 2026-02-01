const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"Res-n-Play" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Res-n-Play',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Welcome to Res-n-Play! 🎾</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for signing up! Please verify your email address to start booking badminton courts.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (email, name, bookingDetails) => {
  const { courtName, playDate, startTime, endTime, totalAmount } = bookingDetails;
  
  const mailOptions = {
    from: `"Res-n-Play" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Booking Confirmed - Res-n-Play',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Booking Confirmed! ✅</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your court booking has been confirmed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Court:</strong> ${courtName}</p>
          <p><strong>Date:</strong> ${new Date(playDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p><strong>Amount Paid:</strong> ₹${totalAmount}</p>
        </div>
        <p>Please arrive 10 minutes before your slot time.</p>
        <p style="color: #666; font-size: 14px;">
          Have a great game! 🏸
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};

module.exports = {
  sendVerificationEmail,
  sendBookingConfirmationEmail
};
