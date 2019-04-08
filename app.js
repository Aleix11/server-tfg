let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

let users = require('./routes/userRoutes');
let games = require('./routes/gameRoutes');
let bets = require('./routes/betRoutes');
let summoners = require('./routes/summonerRoutes');

let app = express();

require('./controllers/initWeb3');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);
app.use('/games', games);
app.use('/bets', bets);
app.use('/summoners', summoners);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Database
// noinspection JSIgnoredPromiseFromCall
mongoose.connect("mongodb://localhost:27017/tfg", function (err, db) {
    if (err) {
        console.error('Database Error: ' + err);
    } else {
        console.log("Database connected...");
        module.exports.db = db;
        app.set('connects', db);
    }
});

app.listen(3000);

module.exports = app;
