const users = require('../model/User')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})


const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  // Confirm data
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check for duplicates
  const duplicate = await users.findOne({ email }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: 'Email Already Exists!!' });
  }

  // Hash password
  const hashPwd = await bcrypt.hash(password, 10); // Salt rounds
  const OTP = Math.floor(100000 + Math.random() * 900000);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "6 Digit code to verify your email Address from VenQ",
    text: `OTP: ${OTP}`,
  }

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      return res.status(400).json({ message: "Email not sent!!!" });
    } else {
      // Store OTP and its expiration time in the user document
      const expirationTime = new Date().getTime() + 3 * 60 * 1000; // 3 minutes
      const userObject = {
        name,
        password: hashPwd,
        email,
        otp: { code: OTP, expiresAt: expirationTime },
      };
      // Create and store new user
      const user = await users.create(userObject);
      const accessToken = jwt.sign(
        {
          UserInfo: {
            email,
            name,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      if (user) {
        return res
          .status(201)
          .json({ message: user, token: accessToken });
      } else {
        return res
          .status(400)
          .json({ message: 'Invalid user data received' });
      }
    }
  });
}


const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide both email and OTP.' });
  }

  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ message: 'User does not exist.' });
    }

    const { code, expiresAt } = existingUser.otp;

    if (code !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP.' });
    }

    if (Date.now() > expiresAt) {
      await users.updateOne(
        { email },
        { $set: { otp: { code: null, expiresAt: null } } }
      );
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    await users.updateOne(
      { email },
      { $set: { isVerified: true, otp: { code: null, expiresAt: null } } }
    );

    return res.status(200).json({ message: 'Account verified successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}


const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {

    // Generate a new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000);

    // Update the existing user document with the new OTP and expiration time
    const expirationTime = new Date().getTime() + 3 * 60 * 1000; // 3 minutes
    const updatedUser = await users.findOneAndUpdate(
      { email },
      { $set: { otp: { code: newOTP, expiresAt: expirationTime } } }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Send the new OTP to the user's email address
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "New 6 Digit code to verify your email Address from VenQ",
      text: `New OTP: ${newOTP}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(400).json({ message: "Email not sent!!!" });
      }
      return res.status(200).json({ message: 'OTP resent successfully!' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
}


const signOut = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);
    const email = decodedToken.UserInfo.email;

    const updatedUser = await users.updateOne(
      { email },
      { $set: { isLoggedIn: false } }
    );

    res.json({ message: 'Successfully logged out' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
}


const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  const foundUser = await users.findOne({ email }).exec()
  if (!foundUser || !foundUser.isVerified) {
    return res.status(401).json({ message: 'User not found or user is not verified' })
  }
  const match = await bcrypt.compare(password, foundUser.password)
  if (!match) return res.status(401).json({ message: 'Please enter correct password' })

  const accessToken = jwt.sign(
    {
      "UserInfo": {
        "email": foundUser.email,
        "name": foundUser.name
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  )

  const updatedUser = await users.updateOne(
    { email },
    { $set: { isLoggedIn: true } }
  );

  // send accesstoken containing username and roles
  res.json({ token: accessToken, message: 'Login Successful' })
}


module.exports = { signUp, verifyEmail, login, signOut, resendOTP }