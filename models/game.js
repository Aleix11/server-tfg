'use strict';

let mongoose = require('mongoose');

let game = mongoose.Schema({
        gameId: String,
        gameStartTime: Number,
        gameMode: String,
        region: String,
        winner: String,
        participants: [{
            encryptedSummonerId: String,
            summonerName: String,
            team: Number, //100-blue 200-red
            championId: Number
        }]
    }, {
        collection: 'game'
    }
);

module.exports = mongoose.model('Game', game);