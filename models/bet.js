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
        id: Number,
        bettor1: String,
        bettor2: String,
        addressBettor1: String,
        addressBettor2: String
    }, {
        collection: 'bet'
    }
);

module.exports = mongoose.model('Bet', bet);