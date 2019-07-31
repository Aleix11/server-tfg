'use strict';

require('../models/user');

let bcrypt = require('bcrypt-nodejs');
let jwt = require('./jwt');
let mongoose = require('mongoose');
let User = mongoose.model('User');
let ObjectId = require('mongodb').ObjectID;
let coreWeb3 = require('./coreWeb3');

let owner = "0x2c33f8f424d25db0c90f47daeb57f30c700ac196";
let contractAddress = "0x6f51c7377cdc5e4526f37ce4d8f848aed1cccf17";

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
    let usr = req.body;
    await bcrypt.hash(usr.password, null, null, async function (err, hash) {

        let newUser = new User(usr);
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

exports.addFriend = async function (req, res) {
    let user = req.body.user;
    let friend = req.body.friend;

    let userFound = await User.findOne({
        _id: ObjectId(user._id)
    });

    let found = userFound.friends.find(frnd => frnd === friend);

    if (!found) {
        await User.findOneAndUpdate({
            _id: ObjectId(user._id)
        }, {
            $push: {friends: friend}
        }, { new: true})
            .then(user => {
                if(user) {
                    res.status(200).json(user);
                } else {
                    res.status(404).json({message: 'User not found'})
                }
            })
            .catch(error => {
                res.status(404).json({message: 'Error adding friend'})
            });
    } else {
        res.status(200).json({message: 'Friend already added'});
    }


};

exports.deleteFriend = async function (req, res) {
    let user = req.body.user;
    let friend = req.body.friend;

    let index = user.friends.findIndex(user => user === friend);
    user.friends.splice(index, 1);

    await User.findOneAndUpdate({
        _id: ObjectId(user._id)
    }, {
        friends: user.friends
    }, { new: true})
        .then(user => {
            if(user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({message: 'User not found'})
            }
        })
        .catch(error => {
            res.status(404).json({message: 'Error adding friend'})
        });
};

exports.editUser = async function (req, res) {
    let user = req.body.user;

    await User.findOneAndUpdate({
        _id: ObjectId(user._id)
    }, {
        email: user.email,
        profilePhoto: user.profilePhoto,
        wallet: user.wallet
    }, {new: true}).then(user => {
       if(user) {
           res.status(200).json(user)
       }
    }).catch(error => {
        res.status(404).json({message: 'Error editing user'})
    });
};

exports.editFavouriteSummoner = async function (req, res) {
    let user = req.body.user;

    await User.findOneAndUpdate({
        _id: ObjectId(user._id)
    }, {
        summoners: user.summoners
    }, {new: true}).then(user => {
        if(user) {
            res.status(200).json(user)
        }
    }).catch(error => {
        res.status(404).json({message: 'Error editing user'})
    });
};

exports.getUserFromId = async function (req, res) {
    let id = req.body.user;

    await User.findOne({
        _id: ObjectId(id)
    })
        .then(user => {
            if(user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({message: 'User not found'})
            }
        })
        .catch(error => {
            res.status(404).json({message: 'Error getting user'})
        });
};

exports.getUserFromUsername = async function (req, res) {
    let user = req.body.user;

    await User.findOne({
        username: user
    })
    .then(user => {
        if(user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({message: 'User not found'})
        }
    })
    .catch(error => {
        res.status(404).json({message: 'Error getting user'})
    });
};

exports.getNumberTokens = async function (req, res) {
    let account = req.body.account;

    console.log(req.body);

    let tokensObject = await coreWeb3.getTokensOfAddress(contractAddress, account, owner);

    console.log(tokensObject);
    if(tokensObject.tokens) {
        res.status(200).send({tokens: tokensObject.tokens})
    }
};

exports.buyTokensPassTokens = async function (req, res) {
    let buyer = req.body.buyer;
    let tokens = req.body.tokens;

    console.log(req.body);

    let tokensObject = await coreWeb3.buyTokensPassTokens(contractAddress, owner, buyer, tokens);

    console.log(tokensObject);
    /*if(tokensObject.tokens) {
        res.status(200).send({tokens: tokensObject.tokens})
    }*/
};

exports.sellTokensPassEthers = async function (req, res) {
    let buyer = req.body.buyer;
    let tokens = req.body.tokens;

    console.log(req.body);

    let tokensObject = await coreWeb3.sellTokensPassEthers(contractAddress, owner, buyer, tokens);

    console.log(tokensObject);
    /*if(tokensObject.tokens) {
        res.status(200).send({tokens: tokensObject.tokens})
    }*/
};

//
// exports.createWallet = async function (req, res) {
//     let user = req.body;
//
//     let wallet = await coreWeb3.createWallet();
//     console.log(wallet['0']);
//
//     await User.findOneAndUpdate({
//         _id: ObjectId(user._id)
//     }, {
//         address: wallet['0'].address,
//         privateKey: wallet['0'].privateKey
//     }, { new: true }).then(usr => {
//         if(usr && usr.address && usr.privateKey) {
//             res.status(200).json(usr);
//         } else {
//             res.status(404).json({message: 'Error updating user'})
//         }
//     }, err => {
//         res.status(404).json({message: 'Error updating user'})
//     });
// };
//
// exports.loadWallet = async function (req, res) {
//     let user = req.body.user;
//
//     let wallet = await coreWeb3.createWallet();
//     console.log(wallet['0']);
//     user.address = wallet['0'].address;
// };
