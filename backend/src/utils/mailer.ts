import nodemailer from 'nodemailer';

// Configure your transport here. For production, use real SMTP details.
// For development, you can use Ethereal or a real Gmail (with App Passwords).
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  },
  connectionTimeout: 5000, // 5 seconds timeout
  greetingTimeout: 5000,
  socketTimeout: 5000
});

export const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: '"Pulse System" <no-reply@pulse.io>',
    to: email,
    subject: 'PULSE | Identity Verification Required',
    html: `
      <div style="font-family: sans-serif; background-color: #050505; color: white; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid #333;">
        <h1 style="color: #0ea5e9; font-weight: 900; letter-spacing: -2px; text-transform: uppercase;">Pulse Verification</h1>
        <p style="color: #71717a; font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Synchronize your neural link</p>
        <div style="margin: 30px 0; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
           <span style="font-size: 32px; font-weight: 900; letter-spacing: 12px; color: #fff;">${otp}</span>
        </div>
        <p style="color: #71717a; font-size: 10px; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px;">This code expires in 10 minutes. Do not share it.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[MAILER] OTP sent to ${email}`);
  } catch (error) {
    console.error('[MAILER ERROR]', error);
    // In dev, we might still want to log the OTP if mailing fails
    console.log(`[SIMULATION FALLBACK] OTP for ${email}: ${otp}`);
  }
};
