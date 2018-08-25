var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var io = require("socket.io")();

var clientRouter = require('./routes/client');
var adminRouter = require('./routes/admin');
var satellite = require('./routes/satellite')(io);

var app = express();

app.io = io;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/client', clientRouter);
app.use('/admin', adminRouter);

module.exports = app;
