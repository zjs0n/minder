const express = require('express')
const mysql = require('mysql')
var cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser');

const config = require('./config.json')

const accountRouter = require('./routes/account')
const userRouter = require('./routes/user')
const movieRouter = require('./routes/movie')

const app = express()

// whitelist localhost 3000
app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }))

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({
  extended: true,
}));
app.use(session({
  secret: 'secret',
  resave: false,
  cookie: { httpOnly: false, secure: false },
  saveUninitialized: true,
}))

// app.use(session({
//     secret: 'secret',
//     resave: false,
//     cookie: { httpOnly: false, secure: false },
//     saveUninitialized: true,
//   }))

app.use('/account', accountRouter)
app.use('/user', userRouter)
app.use('/movie', movieRouter)

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
