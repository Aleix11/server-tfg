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
    address owner = 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c;

    mapping(uint256 => Bet) bets;

    event BetPending(uint256 timestamp);
    event BetOpened(uint256 timestamp);
    event BetClosed(uint256 timestamp);

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
        require(balances[msg.sender] >= _amount);
        require(_amount > 0);
        approve(address (this), _amount);
        transfer(address (this), _amount);
        // bet.newBet(msg.sender, _amount);
        bets[numBets++] = Bet(_amount, BetState.pending, msg.sender, address(0));
        emit BetPending(block.timestamp);

    }

    /*
        @dev Bettor 2 accepts the bet, transfer of tokens from Bettor 2 to this contract, state changed to Open and
        event emitted.
        @param _amount Quantity of tokens for bet
    */
    function betOpen(uint256 _amount, uint256 _id) external {
        require(balances[msg.sender] >= _amount);
        approve(address (this), _amount);
        transfer(address (this), _amount);
        //bet.acceptBet(msg.sender, _amount);
        bets[_id].bettor2 = msg.sender;
        bets[_id].state = BetState.open;
        // bets[_id]= Bet(bets[_id].amount, BetState.open, bets[_id].bettor1, msg.sender);
        emit BetOpened(block.timestamp);
    }

    /*
        @dev At the end of the game, tokens are transferred to the winner, state changed to Close and event emitted
        @param _winner Winner's address of the bet
        @param _amount Quantity of tokens of the bet (question: pass the winning tokens or the betting tokens)
    */
    function betClose(address _winner, uint256 _amount, uint256 _id) external {
        approve(owner, _amount*2);
        transferFrom(owner, _winner, _amount*2);
        // bet.closeBet();
        bets[_id].state = BetState.close;
        // bets[_id] = Bet(bets[_id].amount, BetState.close, bets[_id].bettor1, bets[_id].bettor2);
        emit BetClosed(block.timestamp);
    }

    /*
        @dev If no one accepts the bet, tokens are returned to the Bettor 1, state changed to Close and event emitted
        @param _bettor1 Bettor's 1 address
        @param _amount Quantity of tokens of the bet
    */
    function betCloseFromPending(address _bettor1, uint256 _amount, uint256 _id) external {
        approve(owner, _amount);
        transferFrom(owner, _bettor1, _amount);
        // bet.closeBet();
        bets[_id].state = BetState.open;
        // bets[_id] = Bet(bets[_id].amount, BetState.close, bets[_id].bettor1, bets[_id].bettor2);
        emit BetClosed(block.timestamp);
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
        bets[_id] = Bet(bets[_id].amount, BetState.close, bets[_id].bettor1, bets[_id].bettor2);
        bets[_id].state = BetState.open;
        // bet.closeBet();
        emit BetClosed(block.timestamp);
    }


    function betState(uint256 _id) external view returns (BetState state) {
        state = bets[_id].state;
    }

}
