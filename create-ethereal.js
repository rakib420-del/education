const nodemailer = require('nodemailer');

async function main() {
  const testAccount = await nodemailer.createTestAccount();
  console.log('Ethereal Account Created:');
  console.log('SMTP_HOST=' + testAccount.smtp.host);
  console.log('SMTP_PORT=' + testAccount.smtp.port);
  console.log('SMTP_USER=' + testAccount.user);
  console.log('SMTP_PASS=' + testAccount.pass);
}

main().catch(console.error);
