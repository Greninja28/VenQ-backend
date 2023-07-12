require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')

const PORT = process.env.PORT || 4000
const app = express()

console.log(process.env.NODE_ENV)
connectDB()

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', require('./routes/authRouter'))

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
  console.log(err)
})
