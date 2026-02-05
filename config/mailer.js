const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Simplest for now, can be configured via env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (toEmail, token) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
    const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@indic-tourism.com',
        to: toEmail,
        subject: 'Verify Your Email Address',
        html: `
      <h3>Welcome to TN Tourism!</h3>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>Or copy this link: ${verifyUrl}</p>
    `
    };

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  EMAIL_USER/EMAIL_PASS not set. Printing verification link to console:');
        console.log('---------------------------------------------------');
        console.log(`To: ${toEmail}`);
        console.log(`Link: ${verifyUrl}`);
        console.log('---------------------------------------------------');
        return Promise.resolve(); // Mock success
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent:', info.response);
    } catch (error) {
        console.error('❌ Error sending email:', error);
        // Don't throw, just log, so registration doesn't technically fail if email fails? 
        // Or should we fail? Let's assume fail for now is bad UX if just SMTP is down.
    }
};

module.exports = { sendVerificationEmail };
