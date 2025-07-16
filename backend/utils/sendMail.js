// utils/email.js
const nodemailer = require("nodemailer");

async function sendInvitationEmail({ to, projectName, inviteLink }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // misal: "yourapp@gmail.com"
      pass: process.env.EMAIL_PASS, // app password / generated pass
    },
  });

  const mailOptions = {
    from: `"Taskify App" <${process.env.EMAIL_USER}>`,
    to, // ✅ langsung dari argumen "to"
    subject: `Undangan bergabung ke proyek "${projectName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hai!</h2>
        <p>Kamu diundang untuk bergabung ke proyek <strong>${projectName}</strong>.</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Bergabung ke Proyek</a>
        <p style="font-size: 12px; color: #888; margin-top: 20px;">Abaikan email ini jika kamu tidak mengenalnya.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendInvitationEmail };
