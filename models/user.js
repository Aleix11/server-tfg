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
        summoners: [],
        profilePhoto: String,
        stats: {
            total: Number,
            wins: Number,
            losses: Number,
            ratioWinLose: Number,
            userMostBets: String,
            youAreNemesisOf: String,
            yourNemesisIs: String
        },
        wallet: {}
    }, {
        collection: 'user'
    }
);

module.exports = mongoose.model('User', user);