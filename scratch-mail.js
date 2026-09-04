const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // port 587 is not secure initially (uses STARTTLS)
  auth: {
    user: 'vcixutfydt@gmail.com',
    pass: 'zmun toli kkdl kiac',
  },
});

async function test() {
  console.log('Testing SMTP connection...');
  try {
    await transporter.verify();
    console.log('Connection successful!');
    
    // Optional: Try sending a test email to itself
    const info = await transporter.sendMail({
      from: 'vcixutfydt@gmail.com',
      to: 'kaium4619@gmail.com',
      subject: 'Test Email from Script',
      text: 'This is a direct test email from your local script.',
    });
    console.log('Test email sent! Message ID:', info.messageId);
  } catch (error) {
    console.error('SMTP Error:', error);
  }
}

test();
