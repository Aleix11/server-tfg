'use strict';

require('../models/bet');
let coreWeb3 = require('./coreWeb3');
let mongoose = require('mongoose');
let Bet = mongoose.model('Bet');

exports.createBet = async function (req, res) {
    let bet = req.body.bet;

    let myContract = await coreWeb3.createBet();
    let data = '0x29210327e14bc0580429a881734fdbdbc';

    console.log('tokens', bet.tokens);

    myContract.deploy({
        data: data,
        arguments: [bet.tokens]
    })
    .send({
        gas: 1500000,
        gasPrice: '300000000000',
        from: "0xD7938F40cE185a0B4CD82eeD99bB31d0D93c5c54"
    })
    .on('error', (error) => {
        console.log('error', error);
    })
    .on('transactionHash', (transactionHash) => {
        console.log('transactionHash', transactionHash);
    })
    .on('receipt', async (receipt) => {
        console.log('receipt', receipt.contractAddress); // contains the new contract address

        let now = Date.now();
        bet.duration = now + bet.duration * 60 * 1000;

        let newBet = new Bet(bet);
        await newBet.save()
            .then(async bet => {
                console.log('a', bet);
                res.status(200).json(bet);
            })
            .catch(error => console.log(error));
    })
    .on('confirmation', (confirmationNumber, receipt) => {
        console.log(confirmationNumber, receipt)
    })
    .then((newContractInstance) => {
        console.log(newContractInstance.options.address) // instance with the new contract address
    });
};

exports.searchBet = async function (req, res) {
    let searchBet = req.body.bet;

    await Bet.find({username: searchBet})
        .then(users => {
            if(users) {
                res.status(200).json(users)
            } else {
                res.status(404).json({message: 'Bets not found'})
            }
        })
        .catch(error => {
            res.status(404).json({message: 'Error finding Bets++'})
        });
};