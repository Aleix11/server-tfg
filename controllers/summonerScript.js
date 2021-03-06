'use strict';
const request = require('request');

require('../models/summoner');
let mongoose = require('mongoose');
let Summoner = mongoose.model('Summoner');
let Game = mongoose.model('Game');

let optionsRequest = {
    url: '',
    headers: {
        "Origin": "https://developer.riotgames.com",
        "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Riot-Token": "RGAPI-03dedb91-daea-4471-9b40-c586c3769903",
        "Accept-Language": "es-ES,es;q=0.9",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)  " +
            "Chrome/72.0.3626.119 Safari/537.36"
    }
};

exports.searchSummonerBet = async function (req, res) {
    let summoner = req.body.summonerName;

    console.log(summoner);

    let summonerFound = await Summoner.findOne({summonerName: summoner});

    if(!summonerFound) {
        //attack lol api and save summoner to Summoner collection and then attack to spectator
        optionsRequest.url = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}`;

        request.get(optionsRequest, async function (err, httpResponse, body) {
            if (err) {
                return res.status(400).send(err);
            }
            if (httpResponse.statusCode === 200) {
                let newSumm = Summoner({
                    summonerName:summoner,
                    encryptedSummonerId: JSON.parse(body).id
                });
                let newSummoner = await newSumm.save();
                let spectator = await _spectorGame(newSummoner);
                if(spectator.err) {
                    res.status(404).send({err: spectator.err});
                } else {
                    res.status(200).send(spectator);
                }
            }
        });
    } else {
        let spectator = await _spectorGame(summonerFound);
        if(spectator.err) {
            res.status(404).send({err: spectator.err});
        } else {
            res.status(200).send(spectator);
        }
    }
};

exports.searchSummonerInfo = async function (req, res) {
    let summoner = req.body.summonerName;

    console.log(summoner);

    let summonerFound = await Summoner.findOne({summonerName: summoner});

    console.log(summonerFound);

    if(!summonerFound) {
        //attack lol api and save summoner to Summoner collection and then attack to spectator
        optionsRequest.url = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}`;

        request.get(optionsRequest, async function (err, httpResponse, body) {
            if (err) {
                console.log(err);
                return res.status(400).send(err);
            }

            if (httpResponse.statusCode === 200) {
                let newSumm = Summoner({
                    summonerName:summoner,
                    encryptedSummonerId: JSON.parse(body).id,
                    summonerLevel: JSON.parse(body).summonerLevel
                });

                await Summoner.findOneAndUpdate({
                    encryptedSummonerId: JSON.parse(body).id
                }, {
                    summonerName: summoner,
                    summonerLevel: JSON.parse(body).summonerName
                }).then(summoner => {
                    if(summoner) {
                        res.status(200).json(summoner);
                    } else {
                        newSumm.save().then(summoner => {
                            res.status(200).json(summoner);
                        });
                    }
                });
            } else {
                res.status(400).send({error: "Not Found"});
            }
        });
    } else {
        res.status(200).json(summonerFound);
    }
};

function _spectorGame(summoner) {
    return new Promise( function (resolve, reject) {
        optionsRequest.url = `https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summoner.encryptedSummonerId}`;

        request.get(optionsRequest, async function (err, httpResponse, body) {
            if (err) {
                return err;
            }
            if (httpResponse.statusCode === 200) {
                let game = JSON.parse(body);
                let newGame = {
                    gameId: game.gameId,
                    gameStartTime: game.gameStartTime,
                    gameMode: game.gameMode,
                    region: game.platformId,
                    participants: []
                };
                if (game.participants.length === 10) {
                    game.participants.forEach( function (value) {
                        let part = {
                            encryptedSummonerId: value.summonerId,
                            team: value.teamId,
                            summonerName: value.summonerName,
                            championId: value.championId
                        };
                        newGame.participants.push(part);
                    });
                }
                let gameCreated = Game(newGame);
                resolve(await gameCreated.save());
            } else if (httpResponse.statusCode === 404) {
                resolve({ err: `404-${JSON.parse(body).status.message}`});
            }
        });
    });
}

exports.getMatch = async function(game) {
    return new Promise( function (resolve, reject) {
        optionsRequest.url = `https://euw1.api.riotgames.com/lol/match/v4/matches/${Number(game.gameId)}`;

        request.get(optionsRequest, async function (err, httpResponse, body) {
            if (err) {
                console.log(err);
                return err;
            }
            if (httpResponse.statusCode === 200) {
                let match = JSON.parse(body);

                if(match.teams && match.teams[0].win === 'Win') {
                    game.winner = 'Team A'
                } else {
                    game.winner = 'Team B'
                }

                resolve({
                    mode: 1,
                    game: game
                });
            } else if (httpResponse.statusCode === 404) {
                console.log(404);
                resolve({
                     mode: 2,
                    game: game
                });
            } else{
                resolve({
                    mode: 3,
                    error: httpResponse.body
                });
            }
        });
    });
};
