'use strict';

require('../models/user');

let bcrypt = require('bcrypt-nodejs');
let jwt = require('./jwt');
let mongoose = require('mongoose');
let User = mongoose.model('User');

exports.login = async function (req, res) {
    let user = req.body;

    let userFound = await User.findOne({username: user.username});

    if(!userFound) {
        res.status(404).send({message: 'User not found'});
    } else {
        await bcrypt.compare(user.password, userFound.password, function(err, check){
            if (check) {
                userFound.token = jwt.createToken(userFound);
                res.status(200).json(userFound);
            } else {
                res.status(401).send({message: 'Incorrect credentials'});
            }
        });
    }
};

exports.register = async function (req, res) {
    await bcrypt.hash(req.body.password, null, null, async function (err, hash) {

        let newUser = new User(req.body);
        newUser.password = hash;

        delete newUser.token;

        await newUser.save()
            .then(async user => {
                console.log('a', user);
                user.token = jwt.createToken(user);
                console.log('b', user);
                res.status(200).json(user);
            })
            .catch(error => console.log(error));
    });
};

exports.searchUser = async function (req, res) {
    let searchUser = req.body.user;
    console.log(searchUser);

    await User.find({"username" : {$regex : ".*"+ searchUser +".*"}})
        .then(users => {
            if(users) {
                console.log(users);
                res.status(200).json(users)
            } else {
                res.status(404).json({message: 'Users not found'})
            }
        })
        .catch(error => {
            res.status(404).json({message: 'Error finding users'})
        });
};