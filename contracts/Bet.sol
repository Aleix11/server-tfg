pragma solidity >= 0.4.0 <0.6.0;

import "./BetLibrary.sol";
import "./ERC20.sol";

/*
    @title Manage a bet
*/
contract Bet is ERC20 {

    using BetLibrary for BetLibrary.Bet;

    BetLibrary.Bet public bet;

    event BetPending(uint256 timestamp);
    event BetOpened(uint256 timestamp);
    event BetClosed(uint256 timestamp);

    /*
        @dev Contract (Bet) creation, transfer of tokens from Bettor 1 to this contract, state changed to Pending and
        event emitted.
        @param _amount Quantity of tokens for bet
    */
    constructor (uint256 _amount) public {
        // require(balances[msg.sender] >= _amount);
        transfer(address (this), _amount);
        bet.newBet(msg.sender, _amount);
        emit BetPending(block.timestamp);
    }

    /*
        @dev Bettor 2 accepts the bet, transfer of tokens from Bettor 2 to this contract, state changed to Open and
        event emitted.
        @param _amount Quantity of tokens for bet
    */
    function betOpen(uint256 _amount) external {
        // require(balances[msg.sender] >= _amount);
        transfer(address (this), _amount);
        bet.acceptBet(msg.sender, _amount);
        emit BetOpened(block.timestamp);
    }

    /*
        @dev At the end of the game, tokens are transferred to the winner, state changed to Close and event emitted
        @param _winner Winner's address of the bet
        @param _amount Quantity of tokens of the bet (question: pass the winning tokens or the betting tokens)
    */
    function betClose(address _winner, uint256 _amount) external {
        transferFrom(address (this), _winner, _amount*2);
        bet.closeBet();
        emit BetClosed(block.timestamp);
    }

    /*
        @dev If no one accepts the bet, tokens are returned to the Bettor 1, state changed to Close and event emitted
        @param _bettor1 Bettor's 1 address
        @param _amount Quantity of tokens of the bet
    */
    function betCloseFromPending(address _bettor1, uint256 _amount) external {
        transferFrom(address (this), _bettor1, _amount);
        bet.closeBet();
        emit BetClosed(block.timestamp);
    }

    /*
        @dev If a remake occurs, tokens are returned to the bettors, state changed to Close and event emitted
        @param _bettor1 Bettor's 1 address
        @param _bettor1 Bettor's 2 address
        @param _amount Quantity of tokens of a bet (question: pass the winning tokens or the betting tokens)
    */
    function betCloseRemake(address _bettor1, address _bettor2, uint256 _amount) external {
        transferFrom(address (this), _bettor1, _amount);
        transferFrom(address (this), _bettor2, _amount);
        bet.closeBet();
        emit BetClosed(block.timestamp);
    }
}
