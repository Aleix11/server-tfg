'use strict';

const Web3 = require('web3');
const fs = require('fs');
let solc = require('solc');
const ganache = require('ganache-cli');
const Tx = require('ethereumjs-tx').Transaction;
const keythereum = require('keythereum');

const pass = "1234567890";
const datadir = "/home/aleix/.ethereum/testnet/";

const web3 = new Web3("http://147.83.118.30:8545");

web3.eth.net.isListening()
    .then(console.log);
// Check if the connection has been made
web3.currentProvider ? console.log('web3.js is connected...') : console.error('web3.js is not connected...');

// A new contract instance without bytecode (abi interface)
exports.abiInstance = function (abi) {
    return new web3.eth.Contract(JSON.parse(abi));
};

exports.closeBet = async function (winner, tokens, from, contractAddress, id) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi));
        myContract.options.address = contractAddress;
        console.log(winner, tokens, from, contractAddress, id);

        const toSignTx = {
            from: from,
            to: contractAddress,
            nonce: web3.eth.getTransactionCount(from),
            gas: 300000,
            data: myContract.methods.betClose(winner, tokens, id).encodeABI(),
            value: null,
        };

        let keyObject = keythereum.importFromFile(from, datadir);
        let privateKey = keythereum.recover(pass, keyObject);
        console.log(privateKey, privateKey.toString('hex'));

        try {
            const signedTx = await web3.eth.accounts.signTransaction(toSignTx, "0x"+privateKey.toString('hex'));
            //const sentTx = await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on('error', (error) => {
                    console.log('error', error);
                })
                .on('transactionHash', (transactionHash) => {
                    console.log('transactionHash', transactionHash);
                })
                .on('receipt', async (receipt) => {
                    console.log('receipt', receipt);
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    console.log('confirmation', confirmationNumber, receipt);
                    resolve(receipt);
                });
        } catch (error) {
            console.log(error.message); // By the moment we don't get the revert reason.
            resolve({
                error: error.message
            });
        }
    });
};


exports.closeBetFromPending = async function (bettor1, tokens, from, contractAddress, id) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi));
        myContract.options.address = contractAddress;
        console.log(bettor1, tokens, from, contractAddress, id);

        const toSignTx = {
            from: from,
            to: contractAddress,
            nonce: web3.eth.getTransactionCount(from),
            gas: 300000,
            data: myContract.methods.betCloseFromPending(bettor1, tokens, id).encodeABI(),
            value: null,
        };

        let keyObject = keythereum.importFromFile(from, datadir);
        let privateKey = keythereum.recover(pass, keyObject);
        console.log(privateKey, privateKey.toString('hex'));

        try {
            const signedTx = await web3.eth.accounts.signTransaction(toSignTx, "0x"+privateKey.toString('hex'));
            //const sentTx = await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on('error', (error) => {
                console.log('error', error);
                })
                .on('transactionHash', (transactionHash) => {
                    console.log('transactionHash', transactionHash);
                })
                .on('receipt', async (receipt) => {
                    console.log('receipt', receipt);
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    resolve(receipt);
                });
        } catch (error) {
            console.log(error.message); // By the moment we don't get the revert reason.
            resolve({
                error: error.message
            });
        }
    });
};

exports.closeBetRemake = async function (bettor1, bettor2, tokens, from, contractAddress, id) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);
        console.log(bettor1, tokens, from, contractAddress, id);

        await myContract.methods.betCloseRemake(bettor1, bettor2, tokens, id).send({
            gas: 1500000,
            gasPrice: '300000000000',
            from: from,
        }).on('error', (error) => {
            console.log('error', error);
        })
            .on('transactionHash', (transactionHash) => {
                console.log('transactionHash', transactionHash);
            })
            .on('receipt', async (receipt) => {
                console.log('receipt'); // contains the new contract address
            })
            .on('confirmation', (confirmationNumber, receipt) => {
                console.log(confirmationNumber, receipt)
            })
            .then((newContractInstance) => {
                console.log(newContractInstance); // instance with the new contract address
                resolve(newContractInstance);
            });
    });
};


exports.transferTokens = async function (contractAddress, tokens, from, to) {
    return new Promise(async (resolve, reject) => {

        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi));
        myContract.options.address = contractAddress;

        const toSignTx = {
            from: from,
            to: contractAddress,
            nonce: web3.eth.getTransactionCount(from),
            gas: 300000,
            data: myContract.methods.approve(from, tokens).encodeABI(),
            value: null,
        };

        let keyObject = keythereum.importFromFile(from, datadir);
        let privateKey = keythereum.recover(pass, keyObject);
        console.log(privateKey, privateKey.toString('hex'));

        try {
            const signedTx = await web3.eth.accounts.signTransaction(toSignTx, "0x" + privateKey.toString('hex'));
            //const sentTx = await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on('error', (error) => {
                    console.log('error', error);
                })
                .on('transactionHash', (transactionHash) => {
                    console.log('transactionHash', transactionHash);
                })
                .on('receipt', async (receipt) => {
                    console.log('receipt', receipt);
                })
                .on('confirmation', async (confirmationNumber, receipt) => {
                    console.log('confirmation', confirmationNumber, receipt);
                    const toSignTx2 = {
                        from: from,
                        to: contractAddress,
                        nonce: web3.eth.getTransactionCount(from),
                        gas: 300000,
                        data: myContract.methods.transfer(to, tokens).encodeABI(),
                        value: null,
                    };

                    try {
                        const signedTx2 = await web3.eth.accounts.signTransaction(toSignTx2, "0x" + privateKey.toString('hex'));
                        //const sentTx = await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
                        await web3.eth.sendSignedTransaction(signedTx2.raw || signedTx2.rawTransaction)
                            .on('error', (error) => {
                                console.log('error', error);
                            })
                            .on('transactionHash', (transactionHash) => {
                                console.log('transactionHash', transactionHash);
                            })
                            .on('receipt', async (receipt) => {
                                console.log('receipt', receipt);
                            })
                            .on('confirmation', (confirmationNumber, receipt) => {
                                console.log('confirmation', confirmationNumber, receipt);
                                resolve({error: receipt});
                            });
                    } catch (error) {
                        console.log(error.message); // By the moment we don't get the revert reason.
                        resolve({error: error.message});
                    }
                })
        } catch (error) {
            console.log(error.message); // By the moment we don't get the revert reason.
            resolve({error: error.message});
        }
    });
};

exports.getTokensOfAddress = async function (contractAddress, address, owner) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);

        console.log(contractAddress, address);
        await myContract.methods.balanceOf(address).call({from: address})
            .then((result) => {
                console.log('Result', result);
                if(result) {
                    resolve({tokens:result});
                }
            });
    });

};

exports.buyTokensPassTokens = async function(contractAddress, owner, buyer, tokens) {
    return new Promise(async (resolve, reject) => {
        console.log('llega', owner, typeof owner);
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi));
        myContract.options.address = contractAddress;

        const toSignTx = {
            from: owner,
            to: contractAddress,
            nonce: web3.eth.getTransactionCount(owner),
            gas: 300000,
            data: myContract.methods.buyTokensPassTokens(buyer, tokens).encodeABI(),
            value: null,
        };
        console.log(owner, datadir);


        let keyObject = keythereum.importFromFile(owner, datadir);
        let privateKey = keythereum.recover(pass, keyObject);
        console.log(privateKey, privateKey.toString('hex'));

        try {
            const signedTx = await web3.eth.accounts.signTransaction(toSignTx, "0x"+privateKey.toString('hex'));
            await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on('error', (error) => {
                    console.log('error', error);
                })
                .on('transactionHash', (transactionHash) => {
                    console.log('transactionHash', transactionHash);
                })
                .on('receipt', async (receipt) => {
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    resolve(receipt);
                });
        } catch (error) {
            console.log(error.message); // By the moment we don't get the revert reason.
            resolve({
                error: error.message
            });
        }
    });
};

exports.sellTokensPassEthers = async function(contractAddress, owner, buyer, tokens) {
    return new Promise(async (resolve, reject) => {
        console.log('llega', owner, typeof owner);
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi));
        myContract.options.address = contractAddress;

        const toSignTx = {
            from: owner,
            to: contractAddress,
            nonce: web3.eth.getTransactionCount(owner),
            gas: 300000,
            data: myContract.methods.sellTokensPassEthers(buyer, tokens).encodeABI(),
            value: null,
        };

        let keyObject = keythereum.importFromFile(owner, datadir);
        let privateKey = keythereum.recover(pass, keyObject);
        console.log(privateKey, privateKey.toString('hex'));

        try {
            const signedTx = await web3.eth.accounts.signTransaction(toSignTx, "0x"+privateKey.toString('hex'));
            await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on('error', (error) => {
                    console.log('error', error);
                })
                .on('transactionHash', (transactionHash) => {
                    console.log('transactionHash', transactionHash);
                })
                .on('receipt', async (receipt) => {
                    console.log('receipt');
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    console.log('confirmation', confirmationNumber);
                    resolve(receipt);
                });
        } catch (error) {
            console.log(error.message); // By the moment we don't get the revert reason.
            resolve({
                error: error.message
            });
        }
    });
};

