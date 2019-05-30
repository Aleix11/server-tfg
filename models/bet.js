'use strict';

let mongoose = require('mongoose');

let bet = mongoose.Schema({
        teamA: Array,
        teamB: Array,
        team: String,
        tokens: Number,
        duration: Number,
        summoner: String,
        game: String,
        state: String,
        id: Number
    }, {
        collection: 'bet'
    }
);

module.exports = mongoose.model('Bet', bet);