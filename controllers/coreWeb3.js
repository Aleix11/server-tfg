'use strict';

const Web3 = require('web3');
const fs = require('fs');
let solc = require('solc');
const ganache = require('ganache-cli');
const TX = require('ethereumjs-tx');
const keythereum = require('keythereum');

const pass = "1234567890";
const datadir = "/Users/aleix/Library/Ethereum/testnet/";

// use the given Provider, e.g in Mist, or instantiate a new websocket provider
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));


// A new contract instance without bytecode (abi interface)
exports.abiInstance = function (abi) {
    return new web3.eth.Contract(JSON.parse(abi));
};

exports.createBet = async function (tokens, from, contractAddress) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');

        const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);

        console.log(tokens, from, contractAddress);
        await myContract.methods.betCreate(tokens).send({
            gas: 1500000,
            gasPrice: '300000000000',
            from: from,
        }).on('error', (error) => {
            console.log('error', error);
            resolve({error: error});
        })
            .on('transactionHash', (transactionHash) => {
                console.log('transactionHash', transactionHash);
            })
            .on('receipt', async (receipt) => {
                console.log('receipt', receipt);
            })
            .on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation', confirmationNumber, receipt)
            })
            .then((newContractInstance) => {
                console.log('contractInstance', newContractInstance); // instance with the new contract address
                if(newContractInstance && newContractInstance.events) {
                    console.log(newContractInstance.events.BetPending.returnValues.id);
                    resolve(newContractInstance.events.BetPending.returnValues.id);
                } else {
                    resolve({error: 'Error'});
                }
            });
    });
};

exports.acceptBet = async function (tokens, from, contractAddress, id) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);
        console.log(tokens, from, contractAddress, id);

        await myContract.methods.betOpen(tokens, id).send({
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

exports.closeBet = async function (winner, tokens, from, contractAddress, id) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);
        console.log(winner, tokens, from, contractAddress, id);

        console.log('llega, es el de antes');

        await myContract.methods.betClose(winner, tokens, id).send({
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
                console.log('contract instance', newContractInstance); // instance with the new contract address
                resolve(newContractInstance);
            });
    });
};


exports.closeBetFromPending = async function (bettor1, tokens, from, contractAddress, id) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        let myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);
        console.log(bettor1, tokens, from, contractAddress, id);

        /*await myContract.methods.betCloseFromPending(bettor1, tokens, id).send({
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
        });*/



        await myContract.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));

        console.log('from: ', from, typeof from);
        let nonce = await web3.eth.getTransactionCount(from, 0);

        console.log('nonce: ', nonce);

        let betCloseFromPending = myContract.methods.betCloseFromPending(bettor1, tokens, id);
        let encodedABI = betCloseFromPending.encodeABI();

        let tx = {
            gas: 1500000,
            gasPrice: '30000000000',
            from: from,
            data: encodedABI,
            chainId: 3,
            to: contractAddress,
            nonce: nonce,
        };

        let keyObject = keythereum.importFromFile(from, datadir);
        let privateKey = keythereum.recover(pass, keyObject);
        console.log(privateKey, privateKey.toString('hex'));

        await web3.eth.accounts.signTransaction(tx, privateKey.toString('hex')).then(signed => {
            console.log('signed: ', signed);

            web3.eth.sendSignedTransaction(signed.rawTransaction)
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

                });
        });

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

// exports.transferTokens = async function (contractAddress, tokens, from, to) {
//     let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
//     const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);
//
//     let tx = await myContract.methods.transfer(to, tokens).send({
//         gas: 1500000,
//         gasPrice: '300000000000',
//         from: from,
//     });
//
// };

exports.transferTokens = async function (contractAddress, tokens, from, to) {
    let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
    const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);

    console.log(from, tokens);
    await myContract.methods.approve(from, tokens).send({
        gas: 1500000,
        gasPrice: '300000000000',
        from: from,
    }).on('error', (error) => {
        console.log('error', error);
        return {error: error};
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
    .then(async (newContractInstance) => {
        await myContract.methods.transfer(to, tokens).send({
            gas: 1500000,
            gasPrice: '300000000000',
            from: from,
        }).on('error', (error) => {
            console.log('error', error);
            return {error: error};
        })
        .on('transactionHash', (transactionHash) => {
            console.log('transactionHash', transactionHash);
        })
        .on('receipt', async (receipt) => {
            console.log('receipt', receipt); // contains the new contract address
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log('confirmation', confirmationNumber, receipt)
        })
        .then((newContractInstance) => {
            console.log('then', newContractInstance);
        });
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
        const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);

        // let isUnlocked = await web3.eth.personal.unlockAccount(owner, "1234567890", 0);
        // console.log('unlock: ', isUnlocked);

        console.log('from: ', owner, typeof owner);
        let nonce = await web3.eth.getTransactionCount(owner, 0);

        console.log('nonce: ', nonce);

        let buyTokensPassTokens = myContract.methods.buyTokensPassTokens(buyer, tokens);
        let encodedABI = buyTokensPassTokens.encodeABI();

        let tx = {
            gas: 1500000,
            gasPrice: '30000000000',
            from: owner,
            data: encodedABI,
            chainId: 3,
            to: contractAddress,
            nonce: nonce,
        };

        let keyObject = keythereum.importFromFile(owner, datadir);
        let privateKey = keythereum.recover(pass, keyObject);
        console.log(privateKey, privateKey.toString('hex'));


        console.log(contractAddress, buyer, tokens, owner);

        await web3.eth.accounts.signTransaction(tx, privateKey.toString('hex')).then(async signed => {
            console.log('signed: ', signed);

            await web3.eth.sendSignedTransaction(signed.rawTransaction)
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

                });
        });
        /*await myContract.methods.buyTokensPassTokens(buyer, tokens).send({
            gas: 1500000,
            gasPrice: '300000000000',
            from: owner,
        }).on('error', (error) => {
            console.log('error', error);
            resolve({error: error});
        })
        .on('transactionHash', (transactionHash) => {
            console.log('transactionHash', transactionHash);
        })
        .on('receipt', async (receipt) => {
            console.log('receipt', receipt); // contains the new contract address
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log('confirmation', confirmationNumber, receipt);
            resolve(receipt);
        })
        .then((newContractInstance) => {
            console.log('then', newContractInstance);
        })
        .catch((error) => {
            console.log('error', error);
        });*/
    });
};

exports.sellTokensPassEthers = async function(contractAddress, owner, buyer, tokens) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);

        console.log(contractAddress, buyer, tokens, owner);
        await myContract.methods.sellTokensPassEthers(buyer, tokens).send({
            gas: 1500000,
            gasPrice: '300000000000',
            from: owner,
        }).on('error', (error) => {
            console.log('error', error);
            resolve({error: error});
        })
        .on('transactionHash', (transactionHash) => {
            console.log('transactionHash', transactionHash);
        })
        .on('receipt', async (receipt) => {
            console.log('receipt', receipt); // contains the new contract address
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log('confirmation', confirmationNumber, receipt);
            resolve(receipt);
        })
        .then((newContractInstance) => {
            console.log('then', newContractInstance);
        });
    });
};

exports.createWallet = async function () {
    return new Promise(async (resolve, reject) => {
        let wallet = web3.eth.accounts.wallet.create(1);

        resolve(wallet);
    });
};

exports.loadWallet = async function () {
    return new Promise(async (resolve, reject) => {
        let wallet = web3.eth.accounts.wallet.create(1);

        resolve(wallet);
    });
};



// Compile a contract and get its abi and bytecode
function abiByteCode() {
    let compiledContract = {};

    let input = {
        'Bet.sol': fs.readFileSync('contracts/Bets.sol', 'utf8'),
        'ERC20.sol': fs.readFileSync('contracts/ERC20.sol', 'utf8'),
        'IERC20.sol': fs.readFileSync('contracts/IERC20.sol', 'utf8'),
        'SafeMath.sol': fs.readFileSync('contracts/SafeMath.sol', 'utf8'),
    };

    let compiled = solc.compile({ sources: input }, 1);

    compiledContract.abi = compiled.contracts['Bets.sol:Bets'].interface;
    compiledContract.byteCode = compiled.contracts['Bets.sol:Bets'].bytecode;
    return compiledContract;
}
