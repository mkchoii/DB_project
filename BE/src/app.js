const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const db = require('./db.js');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(express.json());

// 세션
app.use(session({
  secret: 'login-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true
  }
}));

// 라우터 설정
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/loginRoutes'));
app.use('/api', require('./routes/productRoutes'));
app.use('/api', require('./routes/addressRoutes'));
app.use('/api', require('./routes/categoryRoutes'));
app.use('/api', require('./routes/orderRoutes'));
app.use('/api', require('./routes/reviewRoutes'));


app.listen(3000, () => {
  console.log('http://localhost:3000');
});
