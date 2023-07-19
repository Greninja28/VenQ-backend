// const mongoose = require('mongoose')
// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     unique: true,
//     required: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   otp: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   isLoggedIn: {
//     type: Boolean,
//     default: false
//   }

// })


// module.exports = mongoose.model('user', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  otp: {
    code: {
      type: String,
      required: true,
      minlength: 6
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('user', userSchema);
