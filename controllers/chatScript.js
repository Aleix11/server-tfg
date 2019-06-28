'use strict';

require('../models/chat');
require('../models/message');

let mongoose = require('mongoose');
let Chat = mongoose.model('Chat');
let Message = mongoose.model('Message');
let ObjectId = require('mongodb').ObjectID;

exports.getChatRoom = async function(req, res) {
    let users = req.body;

    let room;
    if (users.userFrom.username && users.userTo.username) {
        if (users.userFrom.username.toLowerCase() < users.userTo.username.toLowerCase()) {
            room = "" + users.userFrom._id + "" + users.userTo._id;
        } else {
            room = "" + users.userTo._id + "" + users.userFrom._id;
        }
    }
    res.status(200).send({
        room: room
    });
};

exports.getChatRoomById = async function(req, res) {
    let room = req.body.room;

    let chat = await Chat.find({room: room});

    res.status(200).send(chat);
};

exports.getMessages = async function(req, res) {
    let body = req.body;
    let msgs = await Chat.findOne({ room: body.room }, { messages: 1 });

    let messages = [];

    if(msgs && msgs.messages) {
        for(let i = 0 ; i < msgs.messages.length; i++){
            let message = await Message.findOne({ _id: msgs.messages[i] });
            messages.push(message);
            if(i === msgs.messages.length -1) {
                res.status(200).send({messages: messages});
            }
        }
    } else {
        res.status(200).send({messages: messages});
    }
};

exports.lastView = async function(req, res) {
    let body = req.body;
    console.log(body);
    let update = await Chat.updateOne({room: body.room, "users.userId": ObjectId(body.user)}, {
        $set: {
            "users.$.lastView": body.lastView
        }
    });

    await Message.updateMany({room: body.room, to: body.user, seen: false}, {seen: true});

    res.status(200).send({okey: 'ok'});
};

exports.getChats = async function(req, res) {
    let user = req.body;

    let chats = await Chat.find({ users: {
        $elemMatch: {
            userId: user._id
        }
    }
    }).sort({ created: -1});
    res.status(200).send(chats);
};

exports.createChat = async function(req, res) {
    let users = req.body;

    let room;
    if (users.userFrom.username.toLowerCase() < users.userTo.username.toLowerCase()) {
        room = "" + users.userFrom._id + "" + users.userTo._id;
    } else {
        room = "" + users.userTo._id + "" + users.userFrom._id;
    }
    let checkChat = await Chat.findOne({room: room});

    if(checkChat) {
        res.status(200).send(checkChat);
    } else {
        let newChat = new Chat();
        let from = {
            userId: users.userFrom._id,
            userName: users.userFrom.username,
            userConnected: users.userFrom.connected,
            lastView: Date.now()
        };
        let to = {
            userId: users.userTo._id,
            userName: users.userTo.username,
            userConnected: users.userTo.connected,
            lastView: null
        };
        newChat.users.push(from);
        newChat.users.push(to);
        newChat.created = Date.now();
        newChat.room = room;
        let savedChat = await newChat.save();
        res.status(200).send(savedChat);
    }
};

exports.getMessagesNotSeen = async function(req, res) {
    let user = req.body;

    let messages = await Message.find({to: user._id, seen: false});
    res.status(200).send({number: messages.length});
};
