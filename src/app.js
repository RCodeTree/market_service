var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

/*
    引入路由
*/
var usersRouter = require('./routes/users.route');

var app = express();

// 视图引擎设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
    注册路由
*/
app.use(usersRouter);

// 捕获 404 错误并转发到错误处理器
app.use(function (req, res, next) {
    next(createError(404));
});

// 错误处理器
app.use(function (err, req, res, next) {
    // 设置本地变量，仅在开发环境中提供错误信息
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // 渲染错误页面
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;