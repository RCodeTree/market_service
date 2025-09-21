var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

/*
    引入路由
*/


var app = express();

// 视图引擎设置已移除，项目改为纯API服务

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
    注册路由
*/


// 捕获 404 错误并转发到错误处理器
app.use(function (req, res, next) {
    next(createError(404));
});

// 错误处理器
app.use(function (err, req, res, next) {
    // 返回JSON格式的错误信息
    res.status(err.status || 500).json({
        success: false,
        message: err.message || '服务器内部错误',
        error: req.app.get('env') === 'development' ? err.stack : undefined
    });
});

module.exports = app;