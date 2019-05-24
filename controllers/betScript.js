'use strict';

require('../models/bet');
let coreWeb3 = require('./coreWeb3');
let mongoose = require('mongoose');
let Bet = mongoose.model('Bet');
let ObjectId = require('mongodb').ObjectID;

exports.createBet = async function (req, res) {
    let bet = req.body.bet;

    let myContract = await coreWeb3.createBet();
    let data = '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610314806100606000396000f3fe608060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630900f01014610067578063445df0ac146100b85780638da5cb5b146100e3578063fdacd5761461013a575b600080fd5b34801561007357600080fd5b506100b66004803603602081101561008a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610175565b005b3480156100c457600080fd5b506100cd61025d565b6040518082815260200191505060405180910390f35b3480156100ef57600080fd5b506100f8610263565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561014657600080fd5b506101736004803603602081101561015d57600080fd5b8101908080359060200190929190505050610288565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561025a5760008190508073ffffffffffffffffffffffffffffffffffffffff1663fdacd5766001546040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040180828152602001915050600060405180830381600087803b15801561024057600080fd5b505af1158015610254573d6000803e3d6000fd5b50505050505b50565b60015481565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102e557806001819055505b5056fea165627a7a72305820a36a8a0408882fafef89f8454eefcf771313469ed11255fb37f329cf5aeb75b30029';

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
        bet.state = 'pending';

        let newBet = new Bet(bet);
        await newBet.save()
            .then(async bet => {
                console.log('a', bet);
                res.status(200).json({
                    bet: bet,
                    contractAddress: receipt.contractAddress
                });
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
    let to = req.body.contractAddress;
    let from = req.body.address;
    let tokens = req.body.tokens;
    let betId = req.body.bet;

    let tx = await coreWeb3.acceptBet(tokens, from, to);

    console.log('ieee', tx);

    tx.on('error', (error) => {
            console.log('error', error);
        })
        .on('transactionHash', (transactionHash) => {
            console.log('transactionHash', transactionHash);
        })
        .on('receipt', async (receipt) => {
            console.log('receipt', receipt.contractAddress); // contains the new contract address

            let now = Date.now();
            await Bet.findOneAndUpdate({
                _id: ObjectId(betId)
            }, {
                state: 'open'
            }, { new: true }).then(async bet => {
                    res.status(200).json({
                        bet: bet,
                        contractAddress: receipt.contractAddress
                    });
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

exports.transferTokens = async function (req, res) {
    let contractAddress = req.body.contractAddress;
    let to = req.body.toAddress;
    let from = req.body.fromAddress;
    let tokens = req.body.tokens;

    let tx = await coreWeb3.transferTokens(contractAddress, tokens, from, to);
    tx.on('error', (error) => {
        console.log('error', error);
    })
    .on('transactionHash', (transactionHash) => {
        console.log('transactionHash', transactionHash);
    })
    .on('receipt', async (receipt) => {
        console.log('receipt', receipt); // contains the new contract address
    })
    .on('confirmation', (confirmationNumber, receipt) => {
        console.log('confitmation', confirmationNumber, receipt)
    })
    .then((newContractInstance) => {
        console.log('then', newContractInstance);
        res.status(200).json(newContractInstance);
    });
};

exports.getTokensFromAddress = async function (req, res) {
    let address = req.body.address;
    let contractAddress = req.body.contractAddress;

    console.log(contractAddress);
    let tokens = await coreWeb3.getTokensOfAddress(contractAddress, address);

    res.status(200).json(tokens);
};
