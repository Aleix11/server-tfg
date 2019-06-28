'use strict';

let mongoose = require('mongoose');

let chat = mongoose.Schema({
        room: String,
        users: [],
        created: Number,
        messages: [],
        lastMessage: String,
        lastMessageDate: Number
    }, {
        collection: 'chat'
    }
);

module.exports = mongoose.model('Chat', chat);