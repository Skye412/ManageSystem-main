var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var usersRouter = require('./routes/users');
var manageRouter = require('./routes/manage');
var studentRouter = require('./routes/student');
var enterpriseRouter = require('./routes/enterprise');
var fileRouter = require('./routes/file');
var messageRouter = require('./routes/message');

var app = express();

// CORS 跨域支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 静态文件服务（简历等上传文件）
app.use('/files', express.static(path.join(__dirname, '../files')));

app.use('/user', usersRouter);
app.use('/manage', manageRouter);
app.use('/student', studentRouter);
app.use('/enterprise', enterpriseRouter);
app.use('/file', fileRouter);
app.use('/message', messageRouter);

module.exports = app;
