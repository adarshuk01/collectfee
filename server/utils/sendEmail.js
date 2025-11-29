const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

module.exports = async (to, subject, html) => {
  console.log(to,subject,html);
  
  try {
    await transporter.sendMail({
      from: 'rmycompany <adarshdhanwis@gmail.com>', // Recommended
      to,
      subject,
      html,
    });
    console.log("Email sent successfully!");
    return true;
  } catch (error) {
    console.error("Email Error:", error);
    return false;
  }
};
