require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const cors = require('cors');

require('./app_api/models/db');
require('./app_api/config/passport');

const apiRouter = require('./app_api/routes/index');
const usersRouter = require('./app_server/routes/users');

const app = express();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use('/api', (req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-type, Accept, Authorization');
    next();
})


// View engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public')));
app.use(express.static(path.join(__dirname, 'app_public', 'build')));
app.use(passport.initialize());

// Routes
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// React app routing
app.get(/(\/about)|(\?location\/[a-z0-9]{24})/, (req, res) => {
    res.sendFile(path.join(__dirname, 'app_public', 'build', 'index.html'));
});

// Handle 404 errors
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        next(createError(404));
    } else {
        res.sendFile(path.join(__dirname, 'app_public', 'build', 'index.html'));
    }
});

// Unauthorized Error Handler
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: `${err.name}: ${err.message}` });
    } else {
        next(err);
    }
});

// Error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
