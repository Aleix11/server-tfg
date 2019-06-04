'use strict';

let mongoose = require('mongoose');

let user = mongoose.Schema({
        username: String,
        password: String,
        email: String,
        address: String,
        privateKey: String,
        token: String,
        reset_password_token: String,
        reset_password_expires: Date,
        friends: [],
        summoners: []
    }, {
        collection: 'user'
    }
);

module.exports = mongoose.model('User', user);