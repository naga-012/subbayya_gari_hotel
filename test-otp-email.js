/**
 * Test Script for Live Gmail OTP Delivery
 * Usage: node test-otp-email.js <your_email@gmail.com>
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Read .env if exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

const SENDER_EMAIL = 'myakalanagarjun09@gmail.com';
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
const recipient = process.argv[2] || 'myakalanagarjun@gmail.com';
const testOtp = Math.floor(1000 + Math.random() * 9000).toString();

console.log('----------------------------------------------------');
console.log('📧 Subbayya Gari Hotel - Live Gmail OTP Test');
console.log('----------------------------------------------------');
console.log(`Sender:    ${SENDER_EMAIL}`);
console.log(`Recipient: ${recipient}`);
console.log(`Test OTP:  ${testOtp}`);
console.log(`App Pass:  ${GMAIL_PASSWORD ? 'Configured (Length: ' + GMAIL_PASSWORD.length + ' chars)' : '❌ NOT CONFIGURED'}`);
console.log('----------------------------------------------------');

if (!GMAIL_PASSWORD) {
  console.log('❌ ERROR: GMAIL_APP_PASSWORD is not set in .env or environment variables.');
  console.log('\nTo fix this in 1 minute:');
  console.log('1. Go to https://myaccount.google.com/apppasswords (for ' + SENDER_EMAIL + ')');
  console.log('2. Generate a 16-character App Password');
  console.log('3. Put it in .env file: GMAIL_APP_PASSWORD=your_16_char_password');
  console.log('4. Run: node test-otp-email.js ' + recipient);
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER_EMAIL,
    pass: GMAIL_PASSWORD.replace(/\s+/g, '')
  }
});

console.log('⏳ Connecting to Google Gmail SMTP server...');

transporter.sendMail({
  from: `"Subbayya Gari Hotel" <${SENDER_EMAIL}>`,
  to: recipient,
  subject: `Your Subbayya Gari Hotel Verification Code: ${testOtp} 🍃`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #0F5A27; margin-top: 0;">Subbayya Gari Hotel 🍃</h2>
      <p>Namaskaram! 🙏</p>
      <p>Your login verification OTP is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #D97706; background: #FEF3C7; padding: 12px; text-align: center; border-radius: 6px;">
        ${testOtp}
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 15px;">Valid for 10 minutes. Sent from ${SENDER_EMAIL}.</p>
    </div>
  `
}, (err, info) => {
  if (err) {
    console.error('❌ SMTP Delivery Failed:', err.message);
    if (err.message.includes('535') || err.message.includes('BadCredentials')) {
      console.log('💡 Reason: The Google App Password is invalid or 2-Step Verification is off on ' + SENDER_EMAIL);
    }
  } else {
    console.log('✅ SUCCESS! Email delivered successfully to ' + recipient);
    console.log('Response:', info.response);
  }
});
