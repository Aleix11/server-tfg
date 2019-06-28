'use strict';

let mongoose = require('mongoose');

let bet = mongoose.Schema({
        gameId: String,
        tokens: Number,
        duration: Number,
        summoner: String,
        state: String,
        id: Number,
        bettor1: String,
        bettor2: String,
        teamBettor1: String,
        teamBettor2: String,
        timestampBettor1: Number,
        timestampBettor2: Number,
        addressBettor1: String,
        addressBettor2: String,
        winner: String
    }, {
        collection: 'bet'
    }
);

module.exports = mongoose.model('Bet', bet);