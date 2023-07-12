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
  const { name, email, password } = req.body

  //confirm data:
  if (!email || !password || !name) {
    res.status(400).json({ message: 'All fields are required' })
  }

  //check for duplicates:
  const duplicate = await users.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec();
  if (duplicate) {
    res.status(409).json({ message: 'Email Already Exists!!' })
  }

  //hash password:
  const hashPwd = await bcrypt.hash(password, 10) //salt rounds

  const OTP = Math.floor(100000 + Math.random() * 900000);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "6 Digit code to verify your email Address from VenQ",
    text: `OTP: ${OTP}`
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(400).json({ message: "Email not sent!!!" })
    } else {
      res.status(200).json({ message: "Email sent successfully!!!" })
    }
  })

  const userObject = { name, "password": hashPwd, email, "otp": OTP }

  //create and store new user:
  const user = await users.create(userObject);

  const accessToken = jwt.sign(
    {
      "UserInfo": {
        "email": email,
        "name": name
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1d' }
  )

  res.cookie('jwt', accessToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: 'None', //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match access Token
  })

  if (user) {//created
    res.status(201).json({ message: user, token: accessToken })
  } else {
    res.status(400).json({ message: 'Invalid user data received' })
  }
}

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: 'Enter the OTP!!!' });
  }

  try {
    const existingUser = await users.findOne({ email: email }).exec();

    if (!existingUser) {
      return res.status(400).json({ message: 'User does not exist!!' });
    }

    if (existingUser.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP!!' });
    }

    const updatedUser = await users.updateOne(
      { email: email },
      { $set: { isVerified: true, otp: null } }
    );

    return res.status(200).json({ message: 'Account verified successfully!!!' });

  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};



// const signOut = async (req, res) => {
//   const cookies = req.cookies
//   console.log(cookies);
//   if (!cookies?.jwt) return res.status(204).json({ message: 'Cookie not found' })
//   res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
//   res.json({ message: 'Cookie Cleared' })
// }



// const login = async (req, res) => {
//   const { email, password } = req.body
//   if (!email || !password) {
//     return res.status(400).json({ message: 'All fields are required' })
//   }
//   const foundUser = await users.findOne({ email }).exec()
//   if (!foundUser || !foundUser.isVerified) {
//     return res.status(401).json({ message: 'Unauthorized' })
//   }
//   const match = await bcrypt.compare(password, foundUser.password)
//   if (!match) return res.status(401).json({ message: 'Unauthorized' })

//   const accessToken = jwt.sign(
//     {
//       "UserInfo": {
//         "email": foundUser.email,
//         "name": foundUser.name
//       }
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: '1d' }
//   )
//   res.cookie('jwt', accessToken, {
//     httpOnly: true, //accessible only by web server
//     secure: true, //https
//     sameSite: 'None', //cross-site cookie
//     maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match refresh Token
//   })

//   // send accesstoken containing username and roles
//   res.json({ accessToken })
// }


module.exports = { signUp, verifyEmail }