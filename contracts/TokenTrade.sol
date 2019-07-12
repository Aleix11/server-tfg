pragma solidity  >= 0.4.0 <0.6.0;

import "./ERC20.sol";
import "./Bet.sol";


/*
    @title Manage a TokenTrade
*/
contract TokenTrade is ERC20, Bet {

    using SafeMath for uint256;

    uint256 public tokenBuyPrice = 0.001;
    uint256 public tokenSellPrice = 0.0009; // It's less to take benefits and to pay the gas of the sellTokens transaction

    constructor () public {

    }

    event SellTokens(address _seller, uint256 _amountToken, uint256 _amountEthers);
    event BuyTokens(address _buyer, uint256 _amountToken, uint256 _amountEthers);

    // Function that is called from a user
    function buyTokens() public payable {
        require(msg.value > 0);
        transferFrom(owner, msg.sender, msg.value / tokenBuyPrice);
        owner.transfer(msg.value ether);

        emit BuyTokens(msg.sender, msg.value / tokenBuyPrice, msg.value);
    }

    // Function that is called from the owner
    function sellTokens(address _address, uint _tokens) public payable {
        require(_tokens > 0);
        require(msg.value > 0);
        transfer(_address, _tokens * tokenSellPrice);
        _address.transfer(msg.value ether);

        emit SellTokens(msg.sender, _tokens, msg.value);
    }
}
