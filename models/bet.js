'use strict';

let mongoose = require('mongoose');

let bet = mongoose.Schema({
        teamA: Array,
        teamB: Array,
        team: String,
        tokens: Number,
        duration: Number,
        summoner: String,
        game: String
    }, {
        collection: 'bet'
    }
);

module.exports = mongoose.model('Bet', bet);