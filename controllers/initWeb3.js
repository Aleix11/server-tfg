(async function () {

    const Web3 = require('web3');
    let web3;

    if (typeof web3 !== 'undefined') {
        // In case of already be an active provider
        web3 = await new Web3(web3.givenProvider);
    } else {
        // Set the provider
        web3 = await new Web3(new Web3.providers.HttpProvider('http://192.168.1.48:8545'));
    }
    console.log(web3.currentProvider);
    // Check if the connection has been made
    web3.currentProvider ? console.log('web3.js is connected...') : console.error('web3.js is not connected...');

}());
