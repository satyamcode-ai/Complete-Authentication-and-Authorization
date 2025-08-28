import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587, // use 465 if SSL
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // usually your Brevo login/email
    pass: process.env.SMTP_PASS  // the SMTP key generated in Brevo dashboard
  }
});

export default transporter;
