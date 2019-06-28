'use strict';

let mongoose = require('mongoose');

let message = mongoose.Schema({
        room: String,
        message: String,
        from: String,
        to: String,
        created: Number,
        seen: Boolean
    }, {
        collection: 'message'
    }
);

module.exports = mongoose.model('Message', message);