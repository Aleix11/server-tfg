'use strict';

require('../models/bet');
let coreWeb3 = require('./coreWeb3');
let mongoose = require('mongoose');
let Bet = mongoose.model('Bet');
let Game = mongoose.model('Game');
let User = mongoose.model('User');
let ObjectId = require('mongodb').ObjectID;

let summonerScripts = require('../controllers/summonerScript');


let owner = "0x9ab0d22a0ef99565762a715680bf30cca33e2583";
let contractAddress = "0x7010c0e292652fc7f7bd0a6eb7308063ae72e776";

exports.createBet = async function (req, res) {
    let bet = req.body.bet;

    // let betId = await coreWeb3.createBet(bet.tokens, bet.addressBettor1, contractAddress);
    let betId = req.body.betId;

    if(betId && betId.error) {
        res.status(400).json('Error');
    } else {
        let now = Date.now();
        bet.duration = Math.floor(now/1000) + bet.duration * 60;
        bet.id = betId - 1;
        bet.state = 'pending';
        bet.timestampBettor1 = Math.floor(Date.now()/1000);
        console.log(bet);
        let newBet = new Bet(bet);
        await newBet.save()
            .then(async bet => {
                console.log('id', bet.id);
                res.status(200).json({
                    bet: bet,
                });
            })
            .catch(error => console.log(error));
    }
};

exports.searchBet = async function (req, res) {
    let searchBet = req.body.bet;

    await Bet.find({"summoner" : {$regex : ".*"+ searchBet.summoner +".*"}})
        .then(bets => {
            if(bets) {
                res.status(200).json(bets)
            } else {
                res.status(404).json({message: 'Bets not found'})
            }
        })
        .catch(error => {
            res.status(404).json({message: 'Error finding Bets'})
        });
};

exports.acceptBet = async function (req, res) {
    let bet = req.body.bet;
    console.log(bet);
    if(bet.addressBettor1 !== bet.addressBettor2 && bet.bettor1 !== bet.bettor2) {
        // let tx = await coreWeb3.acceptBet(bet.tokens, bet.addressBettor2, contractAddress, bet.id);

        await Bet.findOneAndUpdate({
            _id: ObjectId(bet._id)
        }, {
            state: 'open',
            bettor2: bet.bettor2,
            timestampBettor2: Math.floor(Date.now()/1000),
            teamBettor2: bet.teamBettor2,
            addressBettor2: bet.addressBettor2
        }, { new: true }).then(async bet => {
            res.status(200).json({
                bet: bet,
            });
        }).catch(error => console.log(error));
    } else {
        res.status(404).json({error: 'Bettor2 is the same as Bettor1 '})
    }
};

exports.closeBet = async function (bet, winner) {
    console.log(bet);

    await coreWeb3.closeBet(winner, bet.tokens, owner, contractAddress, bet.id);

    await Bet.findOneAndUpdate({
        _id: ObjectId(bet._id)
    }, {
        state: 'close',
    }, { new: true }).then(bet => {
        return bet;
    })
    .catch(error => console.log(error));
};

exports.closeFromPending = async function (req, res) {
    let bet = res.body.bet;
    console.log(bet);

    await coreWeb3.closeBetFromPending(bet.addressBettor1, bet.tokens, bet.addressBettor1, contractAddress, bet.id);

    await Bet.findOneAndUpdate({
        _id: ObjectId(bet._id)
    }, {
        state: 'close',
        winner: 'no'
    }, { new: true }).then(bet => {
        console.log(bet._id, bet.state);
        return bet;
    })
        .catch(error => console.log(error));

};

exports.getBetsPendingFromUser = async function (req, res) {
  let user = req.body.user;

    await Bet.find({
        bettor1: user._id,
        state: 'pending'
    }).then(async bts1 => {
        console.log(bts1);
        res.status(200).json(bts1);
    }).catch(error => console.log(error));

};

exports.getBetsOpenFromUser = async function (req, res) {
    let user = req.body.user;

    await Bet.find({
        bettor1: user._id,
        state: 'open'
    }).then(async bts1 => {
        console.log(bts1);
        await Bet.find({
            bettor2: user._id,
            state: 'open'
        }).then(async bts2 => {
            console.log(bts2);
            bts1 = bts1.concat(bts2);
            res.status(200).json(bts1);
        }).catch(error => console.log(error));
    }).catch(error => console.log(error));

};

async function closeBetPending(bet) {
    console.log(bet);

    await coreWeb3.closeBetFromPending(bet.addressBettor1, bet.tokens, owner, contractAddress, bet.id);

    await Bet.findOneAndUpdate({
        _id: ObjectId(bet._id)
    }, {
        state: 'close',
        winner: 'no'
    }, { new: true }).then(bet => {
        console.log(bet._id, bet.state);
        return bet;
    })
        .catch(error => console.log(error));
}

exports.closeBetRemake = async function (bet) {
    console.log(bet);

    await coreWeb3.closeBetRemake(bet.addressBettor1, bet.addressBettor2, bet.tokens, owner, contractAddress, bet.id);

    await Bet.findOneAndUpdate({
        _id: ObjectId(bet._id)
    }, {
        state: 'close',
    }, { new: true }).then(bet => {
        return bet;
    })
        .catch(error => console.log(error));
};

exports.transferTokens = async function (req, res) {
    let contractAddress = req.body.contractAddress;
    let to = req.body.toAddress;
    let from = req.body.fromAddress;
    let tokens = req.body.tokens;

    let tx = await coreWeb3.transferTokens(contractAddress, tokens, from, to);

    if(tx && tx.error) {
        res.status(400).json('Error');

    } else {
        res.status(200).json(tokens);
    }
};

exports.getTokensFromAddress = async function (req, res) {
    let address = req.body.address;
    let contractAddress = req.body.contractAddress;

    let tokens = await coreWeb3.getTokensOfAddress(contractAddress, address);

    console.log(tokens);
    res.status(200).json(tokens);
};

exports.getPendingBets = async function (req, res) {
    let filters = req.body;
    console.log(filters.maxDuration * 60 + Math.floor(Date.now()/1000), filters.minDuration * 60 + Math.floor(Date.now()/1000), filters.maxTokens, filters.minTokens);
    await Bet.find({
        state: 'pending',
        tokens: {
            $lte: filters.maxTokens,
            $gte: filters.minTokens,
        },
        duration: {
            $lte: filters.maxDuration * 60 + Math.floor(Date.now()/1000),
            $gte: filters.minDuration * 60 + Math.floor(Date.now()/1000),
        },
        summoner : {$regex : ".*"+ filters.summoner +".*"},
        bettor1 : {$regex : ".*"+ filters.username +".*"}
    }).then(async bets => {
        console.log(bets);
        res.status(200).json(bets);
    })
    .catch(error => console.log(error));
};

exports.getBet = async function (req, res) {
  let id = req.body.id;

  await Bet.findOne({
      _id: ObjectId(id)
  }).then(async bet => {
      await Game.findOne({
          _id: ObjectId(bet.gameId)
      }).then(async game => {
          let response = {
              bet: bet,
              game: game
          };
          console.log(response);
          res.status(200).json(response);
      })
      .catch(error => console.log(error));
  })
  .catch(error => console.log(error));
};

exports.getBetsFromUser = async function (req, res) {
    let user = req.body.user;
    await Bet.find({
        bettor1: user,
        state: 'close',
        winner: { $in: ['bettor1', 'bettor2'] }
    }).then(async bts1 => {
        console.log(bts1);
        await Bet.find({
            bettor1: user,
            state: 'close',
            winner: { $in: ['bettor1', 'bettor2'] }
        }).then(async bts2 => {
            console.log(bts2);
            bts1 = bts1.concat(bts2);
            res.status(200).json(bts1);
        }).catch(error => console.log(error));
    }).catch(error => console.log(error));
};

exports.cronFunction = function () {
     checkPendingBets();
     checkOpenBets();
     checkCloseBets();
};

async function checkOpenBets() {
    let now = Math.floor(Date.now()/1000);
    await Bet.find({
        state: 'open',
    }).then(bets => {
        bets.forEach(async bet => {
            await Game.findOne({
                _id: ObjectId(bet.gameId)
            }).then(async game => {
                console.log(now, bet.duration, Math.floor(game.gameStartTime/1000) + 15*60, now > Math.floor(game.gameStartTime/1000) + 15*60, +game.gameId, bet.duration > now);
                if(now > (Math.floor(game.gameStartTime/1000) + 15*60)) {
                    if(bet.duration > now) {
                        // Request to see if game is finished
                        // attack lol api to know if game finish
                        let gameUpdated = summonerScripts.getMatch(game);
                        if(gameUpdated.mode = 1 && gameUpdated.game && gameUpdated.game.winner && gameUpdated.game.winner !== '') {
                            await Game.findOneAndUpdate({
                                _id: ObjectId(gameUpdated.game._id)
                            }, {
                                winner: gameUpdated.game.winner
                            }, {new:true} ).then(gamee => console.log('game', gamee));

                            let winner, addressWinner;
                            if(gameUpdated.game.winner === bet.teamBettor1) {
                                winner = 'bettor1';
                                addressWinner = bet.addressBettor1;
                            } else if(gameUpdated.game.winner === bet.teamBettor1) {
                                winner = 'bettor2';
                                addressWinner = bet.addressBettor2;
                            }
                            await coreWeb3.closeBet(addressWinner, bet.tokens, owner, contractAddress, bet.id);

                            await Bet.findOneAndUpdate({
                                _id: ObjectId(bet._id)
                            }, {
                                state: 'close',
                                winner: winner
                            }, { new: true }).then(beet => console.log('beet: ', beet));
                            stats(bet.bettor1);
                            stats(bet.bettor2);
                        } else if(gameUpdated.mode = 2) {
                            await Bet.findOneAndUpdate({
                                _id: bet._id
                            }, {
                                state: 'close'
                            }).then(beet => console.log(beet));
                        }
                    } else {
                        // Request to see if game is finished
                        // Close bet
                        let gameUpdated = await summonerScripts.getMatch(game);
                        if(gameUpdated.mode = 1 && gameUpdated.game && gameUpdated.game.winner && gameUpdated.game.winner !== '') {
                            await Game.findOneAndUpdate({
                                _id: ObjectId(gameUpdated.game._id)
                            }, {
                                winner: gameUpdated.game.winner
                            }).then(gamee => console.log('game: ', gamee));

                            let winner, addressWinner;
                            if(gameUpdated.game.winner === bet.teamBettor1) {
                                winner = 'bettor1';
                                addressWinner = bet.addressBettor1;
                            } else if(gameUpdated.game.winner === bet.teamBettor1) {
                                winner = 'bettor2';
                                addressWinner = bet.addressBettor2;
                            }
                            console.log('winner: ', addressWinner, gameUpdated.winner, bet.addressBettor1, bet.addressBettor2);
                            await coreWeb3.closeBet(addressWinner, bet.tokens, owner, contractAddress, bet.id);

                            console.log(bet._id, winner);
                            await Bet.findOneAndUpdate({
                                _id: ObjectId(bet._id)
                            }, {
                                state: 'close',
                                winner: winner
                            }).then(beet => console.log('beet: ',beet));
                            stats(bet.bettor1);
                            stats(bet.bettor2);
                        } else if(gameUpdated.mode = 2) {
                            await Bet.findOneAndUpdate({
                                _id: ObjectId(bet._id),
                                winner: 'no'
                            }, {
                                state: 'close'
                            }).then(beet => console.log(beet));
                        }
                    }
                }
            })
        });
    });
}

async function checkPendingBets() {
    let now = Math.floor(Date.now()/1000);
    await Bet.find({
        state: 'pending',
        duration: { $lt: now },
    }).then(bets => {
        bets.forEach(bet => {
            console.log(now, bet.duration);

            closeBetPending(bet);
        });
    });
}

async function checkCloseBets() {
    let now = Math.floor(Date.now()/1000);
    await Bet.find({
        state: 'close',
        winner: { $nin: ['bettor1', 'bettor2', 'no'] }
    }).then(bets => {
        console.log('close bets', bets);
        bets.forEach(async bet => {
            // closeBetWithoutWinner(bet);
            let now = Math.floor(Date.now()/1000);

            await Game.findOne({
                _id: ObjectId(bet.gameId)
            }).then(async game => {
                // attack lol api to know if game finish
                let gameUpdated = await summonerScripts.getMatch(game);

                if(gameUpdated.mode !== 3) {
                    console.log('mode', gameUpdated.mode, gameUpdated.game._id, gameUpdated.game.winner);
                } else {
                    console.log('mode', gameUpdated.mode);
                }
                if(gameUpdated.mode = 1 && gameUpdated.game && gameUpdated.game.winner && gameUpdated.game.winner !== '') {
                    await Game.findOneAndUpdate({
                        _id: ObjectId(gameUpdated.game._id)
                    }, {
                        winner: gameUpdated.game.winner
                    }).then(gamee => console.log('game', game._id));

                    let winner, addressWinner;
                    if(gameUpdated.game.winner === bet.teamBettor1) {
                        winner = 'bettor1';
                        addressWinner = bet.addressBettor1;

                    } else if(gameUpdated.game.winner === bet.teamBettor2) {
                        winner = 'bettor2';
                        addressWinner = bet.addressBettor2;
                    }

                    await coreWeb3.closeBet(addressWinner, bet.tokens, owner, contractAddress, bet.id);

                    console.log('winner: ', winner, gameUpdated.game.winner, bet.teamBettor1, bet.teamBettor2);
                    await Bet.findOneAndUpdate({
                        _id: ObjectId(bet._id)
                    }, {
                        state: 'close',
                        winner: winner
                    }).then(beet => {
                        if(beet) {
                            console.log(1, beet._id)
                        } else {
                            console.log(1, null)
                        }
                    });
                    stats(bet.bettor1);
                    stats(bet.bettor2);
                } else if(gameUpdated.mode = 2) {
                    await Bet.findOneAndUpdate({
                        _id: bet._id
                    }, {
                        state: 'close'
                    }).then(beet => {
                        if(beet) {
                            console.log(1, beet._id)
                        } else {
                            console.log(1, null)
                        }
                    });
                }
            })
        });
    });
}

async function stats(user) {
    await Bet.find({
        bettor1: user
    }).then(async bets1 => {
        await Bet.find({
            bettor2: user
        }).then(async bets2 => {
            bets1 = bets1.concat(bets2);
            let wins = 0;
            let losses = 0;
            let win = [];
            let loss = [];
            let bets = [];

            bets1.forEach(async (bet, index) => {
                if(bet.winner === 'bettor1') {
                    if(bet.bettor1 === user) {
                        wins++;
                        let bt = win.findIndex(wn => wn.vs === bet.bettor2);
                        if(bt !== -1) {
                            win[bt].quantity++;
                        } else {
                            win.push({
                                vs: bet.bettor2,
                                quantity: 1
                            })
                        }
                        let bts = bets.findIndex(bt => bt.vs === bet.bettor2);
                        if(bts !== -1) {
                            bets[bts].quantity++;
                        } else {
                            bets.push({
                                vs: bet.bettor2,
                                quantity: 1
                            })
                        }
                    } else {
                        losses++;
                        let bt = loss.findIndex(lss => lss.vs === bet.bettor1);
                        if(bt !== -1) {
                            loss[bt].quantity++;
                        } else {
                            loss.push({
                                vs: bet.bettor1,
                                quantity: 1
                            })
                        }
                        let bts = bets.findIndex(bt => bt.vs === bet.bettor1);
                        if(bts !== -1) {
                            bets[bts].quantity++;
                        } else {
                            bets.push({
                                vs: bet.bettor1,
                                quantity: 1
                            })
                        }
                    }
                } else if(bet.winner === 'bettor2') {
                    if(bet.bettor2 === user) {
                        wins++;
                        let bt = win.findIndex(win => win.vs === bet.bettor1);
                        if(bt !== -1) {
                            win[bt].quantity++;
                        } else {
                            win.push({
                                vs: bet.bettor1,
                                quantity: 1
                            })
                        }
                        let bts = bets.findIndex(bt => bt.vs === bet.bettor1);
                        if(bts !== -1) {
                            bets[bts].quantity++;
                        } else {
                            bets.push({
                                vs: bet.bettor1,
                                quantity: 1
                            })
                        }
                    } else {
                        losses++;
                        let bt = loss.findIndex(lss => lss.vs === bet.bettor2);
                        if(bt !== -1) {
                            loss[bt].quantity++;
                        } else {
                            loss.push({
                                vs: bet.bettor2,
                                quantity: 1
                            })
                        }
                        let bts = bets.findIndex(bt => bt.vs === bet.bettor2);
                        if(bts !== -1) {
                            bets[bts].quantity++;
                        } else {
                            bets.push({
                                vs: bet.bettor2,
                                quantity: 1
                            })
                        }
                    }
                }

                if(index === bets1.length - 1) {
                    win.sort(function (a, b) {
                       if(a.quantity < b.quantity) return -1;
                       if(a.quantity > b.quantity) return 1;
                       return 0;
                    });
                    loss.sort(function (a, b) {
                        if(a.quantity < b.quantity) return -1;
                        if(a.quantity > b.quantity) return 1;
                        return 0;
                    });
                    bets.sort(function (a, b) {
                        if(a.quantity < b.quantity) return -1;
                        if(a.quantity > b.quantity) return 1;
                        return 0;
                    });
                    console.log('aaaa', win, loss, bets);
                    await User.findOneAndUpdate({
                        username: user
                    }, {
                        "stats.total": bets1.length,
                        "stats.losses": losses,
                        "stats.wins": wins,
                        "stats.ratioWinLose": wins/losses,
                        "stats.userMostBets": bets[0].vs,
                        "stats.youAreNemesisOf": win[0].vs,
                        "stats.yourNemesisIs": loss[0].vs
                    }, {new:true});
                }
            });
        });
    });
}