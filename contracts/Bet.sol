pragma solidity >= 0.4.0 <0.6.0;
pragma experimental ABIEncoderV2;

import "./ERC20.sol";

/*
    @title Manage a bet
*/
contract Bets is ERC20 {

    // using BetLibrary for BetLibrary.Bet;

    // BetLibrary.Bet public bet;

    enum BetState { open, close, pending }

    struct Bet {
        uint256 amount;
        BetState state;
        address bettor1;
        address bettor2;
    }

    uint256 numBets;
    address owner;

    mapping(uint256 => Bet) public bets;

    event BetPending(uint256 timestamp, uint256 id);
    event BetOpened(uint256 timestamp, uint256 id);
    event BetClosed(uint256 timestamp, uint256 id);

    /*
        @dev Contract (Bet) creation, transfer of tokens from Bettor 1 to this contract, state changed to Pending and
        event emitted.
        @param _amount Quantity of tokens for bet
    */
    constructor () public {
        owner = msg.sender;
    }

    /*
        @dev Bettor 2 accepts the bet, transfer of tokens from Bettor 2 to this contract, state changed to Open and
        event emitted.
        @param _amount Quantity of tokens for bet
    */
    function betCreate(uint256 _amount) external {
        /*require(balances[msg.sender] >= _amount);
        require(_amount > 0);*/
        approve(owner, _amount);
        transfer(owner, _amount);
        bets[numBets++] = Bet(_amount, BetState.pending, msg.sender, address(0));
        emit BetPending(block.timestamp, numBets);

    }

    /*
        @dev Bettor 2 accepts the bet, transfer of tokens from Bettor 2 to this contract, state changed to Open and
        event emitted.
        @param _amount Quantity of tokens for bet
    */
    function betOpen(uint256 _amount, uint256 _id) external {
        require(balances[msg.sender] >= _amount);
        approve(owner, _amount);
        transfer(owner, _amount);
        bets[_id].bettor2 = msg.sender;
        bets[_id].state = BetState.open;
        emit BetOpened(block.timestamp, _id);
    }

    /*
        @dev At the end of the game, tokens are transferred to the winner, state changed to Close and event emitted
        @param _winner Winner's address of the bet
        @param _amount Quantity of tokens of the bet (question: pass the winning tokens or the betting tokens)
    */
    function betClose(address _winner, uint256 _amount, uint256 _id) external {
        approve(owner, _amount*2);
        transferFrom(owner, _winner, _amount*2);
        bets[_id].state = BetState.close;
        emit BetClosed(block.timestamp, _id);
    }

    /*
        @dev If no one accepts the bet, tokens are returned to the Bettor 1, state changed to Close and event emitted
        @param _bettor1 Bettor's 1 address
        @param _amount Quantity of tokens of the bet
    */
    function betCloseFromPending(address _bettor1, uint256 _amount, uint256 _id) external {
        approve(owner, _amount);
        transferFrom(owner, _bettor1, _amount);
        bets[_id].state = BetState.close;
        emit BetClosed(block.timestamp, _id);
    }

    /*
        @dev If a remake occurs, tokens are returned to the bettors, state changed to Close and event emitted
        @param _bettor1 Bettor's 1 address
        @param _bettor1 Bettor's 2 address
        @param _amount Quantity of tokens of a bet (question: pass the winning tokens or the betting tokens)
    */
    function betCloseRemake(address _bettor1, address _bettor2, uint256 _amount, uint256 _id) external {
        transferFrom(owner, _bettor1, _amount);
        transferFrom(owner, _bettor2, _amount);
        bets[_id].state = BetState.close;
        emit BetClosed(block.timestamp, _id);
    }


    function betState(uint256 _id) external view returns (BetState state) {
        state = bets[_id].state;
    }


}
