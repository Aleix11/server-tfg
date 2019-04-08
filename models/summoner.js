'use strict';

let mongoose = require('mongoose');

let summoner = mongoose.Schema({
        summonerName: String,
        encryptedSummonerId: String
    }, {
        collection: 'summoner'
    }
);

module.exports = mongoose.model('Summoner', summoner);