'use strict';

let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'clave_secreta';

exports.ensureAuth = function(req, res, next){
    let payload;

    if (!req.headers.authorization) {
        return res.status(403).send({message: 'Petition has not an authentication header'});
    }

    let token = req.headers.authorization.replace(/['"]+/g,'');
    console.log(token, req.headers);
    try {
        payload = jwt.decode(token, secret);
        console.log('payload', payload);
        if (payload.exp >= moment().unix){
            return res.status(401).send({
                message: 'Token expired'
            })
        }
    } catch(ex){
        return res.status(404).send({
            message: 'Token not valid'
        })
    }
    req.user = payload;

    next();
};
