const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Registration function
exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const newUser = new User({ name, email, password, mobile, role });
    await newUser.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'No user' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
};

const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

exports.sendOtp = async (req, res) => {
  const { identifier } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.create({ identifier, otp });

  if (/^\d{10}$/.test(identifier)) {
    // Assume it's a mobile number
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${identifier}`
    });
  } else {
    // Assume it's an email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      to: identifier,
      subject: 'Your OTP Code',
      html: `<p>Your OTP is <strong>${otp}</strong></p>`
    });
  }

  res.json({ msg: 'OTP sent' });
};

exports.verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;
  const record = await Otp.findOne({ identifier, otp });

  if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });

  // Create JWT token here
  const user = await User.findOne({ email: identifier }) || await User.findOne({ mobile: identifier });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  await Otp.deleteMany({ identifier }); // Clean up

  res.json({ token, user });
};
