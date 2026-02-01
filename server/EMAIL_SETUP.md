# Email Verification Setup Guide

## How to Configure Gmail for Email Verification

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on **"2-Step Verification"**
3. Follow the steps to enable 2FA

### Step 2: Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "Res-n-Play"
4. Click **Generate**
5. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### Step 3: Update Your .env File

Add these lines to your `.env` file:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The app password from step 2
FRONTEND_URL=http://localhost:3000   # Your frontend URL
```

### Step 4: Test Email Sending

Run your server and try signing up with a real email address. You should receive a verification email.

---

## Alternative Email Services

### Using SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Get API key
3. Update `config/email.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Using Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get SMTP credentials
3. Update `.env`:

```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

---

## Email Verification Flow

### 1. User Signs Up
- User creates account
- Receives verification email
- Account marked as unverified

### 2. User Clicks Verification Link
- Link format: `http://localhost:3000/verify-email?token=abc123...`
- Backend verifies token
- Account marked as verified

### 3. User Can Now Login
- Only verified users can login
- Unverified users see: "Please verify your email"

---

## API Endpoints

### POST /api/auth/signup
Creates account and sends verification email

### GET /api/auth/verify-email?token=xxx
Verifies email using token

### POST /api/auth/resend-verification
Resends verification email

### POST /api/auth/login
Only allows verified users to login

---

## Troubleshooting

### Email Not Sending?

1. **Check Gmail Settings**: Make sure 2FA is enabled and app password is correct
2. **Check .env File**: Verify EMAIL_USER and EMAIL_PASSWORD are set
3. **Check Console**: Look for error messages in terminal
4. **Test SMTP Connection**: 
   ```javascript
   transporter.verify((error, success) => {
     if (error) console.log(error);
     else console.log('Server is ready to send emails');
   });
   ```

### Email Going to Spam?

1. Use a professional email domain
2. Add SPF/DKIM records (for production)
3. Use verified email service like SendGrid
4. Add unsubscribe link

---

## Security Best Practices

✅ Token expires in 24 hours
✅ Token is single-use (deleted after verification)
✅ Use HTTPS in production
✅ Never log email passwords
✅ Use environment variables for credentials
