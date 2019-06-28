let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let timeout = require('connect-timeout'); //express v4
let CronJob = require('cron').CronJob;

let users = require('./routes/userRoutes');
let chats = require('./routes/chatRoutes');
let games = require('./routes/gameRoutes');
let bets = require('./routes/betRoutes');
let summoners = require('./routes/summonerRoutes');
let betScripts = require('./controllers/betScript');

let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

require('./models/chat');
require('./models/message');
require('./models/user');
let Chat = mongoose.model('Chat');
let Message = mongoose.model('Message');
let User = mongoose.model('User');

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    next();
};

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
app.use(allowCrossDomain);
app.use(express.static(path.join(__dirname, 'public')));

app.use(timeout(120000));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
    if (!req.timedout) next();
}

app.use('/users', users);
app.use('/games', games);
app.use('/bets', bets);
app.use('/summoners', summoners);
app.use('/chats', chats);


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
mongoose.connect("mongodb://localhost:27017/tfg",{
    useNewUrlParser: true,
    reconnectTries : Number.MAX_VALUE,
    autoReconnect : true,
    reconnectInterval: 500
});

// When successfully connected
mongoose.connection.on('connected', () => {
    console.log('dbevent: open');
});

// When successfully reconnected
mongoose.connection.on('reconnected', () => {
    console.log('dbevent: reconnected');
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
    console.log(`dbevent: error: ${err}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('dbevent: disconnected');
    mongoose.connect("mongodb://localhost:27017/tfg",{
        useNewUrlParser: true,
        reconnectTries : Number.MAX_VALUE,
        autoReconnect : true,
        reconnectInterval: 500
    });
});

const job = new CronJob('0 */1 * * * *', function() {
    const d = new Date();
    console.log('At 2 Minutes:', d);
    betScripts.cronFunction();
});
job.start();

io.on('connection', (socket) => {
    socket.on('subscribe', async function(users) {
        console.log(users);
        let room;
        if(users && users.userFrom && users.userTo){
            if(users.userFrom.username && users.userTo.username) {
                if (users.userFrom.username.toLowerCase() < users.userTo.username.toLowerCase()) {
                    room = "" + users.userFrom._id + "" + users.userTo._id;
                } else {
                    room = "" + users.userTo._id + "" + users.userFrom._id;
                }
            }
            let checkChat = await Chat.findOne({ room: room });
            if(checkChat) {
                checkChat.users.find(user => {
                    if(user.userId === users.userFrom._id) {
                        user.lastView = Date.now();
                    }
                });
                await Chat.findOneAndUpdate({ room: room }, checkChat);

                console.log('joining room', room);
                socket.join(room);
            } else {
                let newChat = new Chat();
                newChat.room = room;
                newChat.created = Date.now();
                newChat.users.push({
                    userId: users.userFrom._id,
                    userName: users.userFrom.username,
                    userConnected: users.userFrom.connected,
                    lastView: Date.now()
                });
                newChat.users.push({
                    userId: users.userTo._id,
                    userName: users.userTo.username,
                    userConnected: users.userTo.connected,
                    lastView: null
                });
                await newChat.save();

                console.log('joining room', room);
                socket.join(room);
            }
        }
    });

    socket.on('disconnect', async function (username) {
        await User.findOneAndUpdate({name: username}, {connected: false}, {new: true});
        socket.emit('user-changed', {
            user: socket.username,
            event: 'left'
        })
    });

    socket.on('set-username', async (username) => {
        socket.username = username;
        await User.findOneAndUpdate({name: username}, {connected: true}, {new: true});
        socket.emit('users-changed', {
            user: username,
            event: 'joined'
        });
    });

    socket.on('add-message', async (message) => {
        console.log('message', message);
        let msg = new Message(message);
        let msgSaved = await msg.save();
        console.log('msgSaved', msgSaved);
        await Chat.updateOne({ room: message.room }, {
            $push: {
                messages: msgSaved._id
            },
        });
        await Chat.findOneAndUpdate({room: message.room}, {
            lastMessage: msgSaved.message,
            lastMessageDate: msgSaved.created
        });


        console.log('sending room post', message);
        socket.to(message.room).emit('message', msgSaved);
    });
});

let port = process.env.PORT || 3001;

http.listen(port, function(){
    console.log('listening in http://localhost:' + port);
});

app.listen(3000);

module.exports = app;
