const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')


router.post('/user/register', authController.signUp)
router.post('/user/verify', authController.verifyEmail)
router.post('/user/signout', authController.signOut)
router.post('/user/login', authController.login)
router.post('/user/resendOTP', authController.resendOTP)

module.exports = router