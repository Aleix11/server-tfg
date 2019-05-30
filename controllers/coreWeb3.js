'use strict';

const Web3 = require('web3');
const fs = require('fs');
let solc = require('solc');
const ganache = require('ganache-cli');

// use the given Provider, e.g in Mist, or instantiate a new websocket provider
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));


// A new contract instance without bytecode (abi interface)
exports.abiInstance = function (abi) {
    return new web3.eth.Contract(JSON.parse(abi));
};

exports.createBet = async function (tokens, from, to) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');

        const myContract = new web3.eth.Contract(JSON.parse(abi), to);

        console.log(tokens, from, to);
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
                console.log('receipt');
            })
            .on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation', confirmationNumber, receipt)
            })
            .then((newContractInstance) => {
                console.log('contractInstance', newContractInstance.events); // instance with the new contract address
                if(newContractInstance && newContractInstance.events) {
                    console.log(newContractInstance.events.BetPending.returnValues.id);
                    resolve(newContractInstance.events.BetPending.returnValues.id);
                } else {
                    resolve({error: 'Error'});
                }
            });
    });
};

exports.acceptBet = async function (tokens, from, to, id) {
    return new Promise(async (resolve, reject) => {
        let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
        const myContract = new web3.eth.Contract(JSON.parse(abi), to);
        console.log(tokens, from, to, id);

        return await myContract.methods.betOpen(tokens, id).send({
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

exports.getTokensOfAddress = async function (contractAddress, address) {
    let abi = fs.readFileSync('./contracts/build/Bets.abi', 'utf8');
    const myContract = new web3.eth.Contract(JSON.parse(abi), contractAddress);

    return await myContract.methods.balanceOf(address).call()
        .then('then', (result) => {
            console.log('Result', result);
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