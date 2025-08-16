// emailer.js
import nodemailer from 'nodemailer';

// configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'karthikgopireddy2001@gmail.com',        // replace with your Gmail
    pass: 'ygaqktikucrorlmu'            // use app password from Google
  }
});

export const sendEmail = async (toEmail, subject, message) => {
  const mailOptions = {
    from: 'karthikgopireddy2001@gmail.com',
    to: toEmail,
    subject: subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

