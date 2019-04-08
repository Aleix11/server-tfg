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

exports.createBet = async function () {
    // let compiledContract = await abiByteCode(); //In case of different/multi contracts put inside of the below loop

    let abi = fs.readFileSync('./contracts/build/Bet.abi', 'utf8');

    return await new web3.eth.Contract(JSON.parse(abi));
};

// Compile a contract and get its abi and bytecode
function abiByteCode() {
    let compiledContract = {};

    let input = {
        'Bet.sol': fs.readFileSync('contracts/Bet.sol', 'utf8'),
        'ERC20.sol': fs.readFileSync('contracts/ERC20.sol', 'utf8'),
        'BetLibrary.sol': fs.readFileSync('contracts/BetLibrary.sol', 'utf8'),
        'IERC20.sol': fs.readFileSync('contracts/IERC20.sol', 'utf8'),
        'SafeMath.sol': fs.readFileSync('contracts/SafeMath.sol', 'utf8'),
    };

    let compiled = solc.compile({ sources: input }, 1);

    compiledContract.abi = compiled.contracts['Bet.sol:Bet'].interface;
    compiledContract.byteCode = compiled.contracts['Bet.sol:Bet'].bytecode;
    return compiledContract;
}