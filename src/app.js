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

// CORS中间件
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 设置信任代理，用于获取真实IP
app.set('trust proxy', true);

/*
    注册路由
*/
app.use('/api', usersRouter);


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