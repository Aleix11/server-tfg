'use strict';

let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'clave_secreta';

exports.createToken = function (user) {
    let payload = {
        sub: user._id,
        name: user.name,
        iat: moment().unix(),
        exp: moment().add(30, 'days'.unix)
    };

    return jwt.encode(payload, secret);
};
