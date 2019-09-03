pragma solidity >= 0.4.0 <0.6.0;
pragma experimental ABIEncoderV2;

import "./ERC20.sol";

/*
    @title Manage a bet
*/
contract Bets is ERC20 {

    using SafeMath for uint256;

    enum BetState { open, close, pending }

    struct Bet {
        uint256 amount;
        BetState state;
        address bettor1;
        address bettor2;
    }

    uint256 returnedTokens = 9500;
    uint256 numBets;
    address payable owner;

    mapping(uint256 => Bet) public bets;

    uint256 public tokenBuyPrice = 900;
    uint256 public tokenSellPrice = 1000;

    mapping(address => uint256) tokensToBuy;
    mapping(address => uint256) tokensToSell;


    event BetPending(uint256 timestamp, uint256 id);
    event BetOpened(uint256 timestamp, uint256 id);
    event BetClosed(uint256 timestamp, uint256 id);

    event BuyTokensSendEthers(address buyer, uint256 tokens);
    event BuyTokensSendTokens(address buyer, uint256 tokens);
    event SellTokensSendEthers(address seller, uint256 tokens);
    event SellTokensSendTokens(address seller, uint256 tokens);



    /*
        @dev Contract (Bet) creation, transfer of tokens from Bettor 1 to this contract, state changed to Pending and
        event emitted.
        @param _amount Quantity of tokens for bet
    */
    constructor () public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    /*
        @dev Bettor 2 accepts the bet, transfer of tokens
        from Bettor 2 to this contract, state changed to
        Open and event emitted.
        @param _amount Quantity of tokens for bet
    */
    function betCreate(uint256 _amount) external {
        require(balances[msg.sender] >= _amount);
        require(_amount > 0);
        approve(msg.sender, _amount);
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
        require(bets[_id].state == BetState.pending); // Comprovar que funciona
        require(balances[msg.sender] >= _amount);
        approve(msg.sender, _amount);
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
    function betClose(address _winner, uint256 _amount, uint256 _id) external onlyOwner {
        require(bets[_id].state == BetState.open);
        approve(owner, _amount.mul(2));
        transferFrom(owner, _winner, _amount.mul(2).mul(returnedTokens).div(10000));
        bets[_id].state = BetState.close;
        emit BetClosed(block.timestamp, _id);
    }

    /*
        @dev If no one accepts the bet, tokens are returned to the Bettor 1, state changed to Close and event emitted
        @param _bettor1 Bettor's 1 address
        @param _amount Quantity of tokens of the bet
    */
    function betCloseFromPending(address _bettor1, uint256 _amount, uint256 _id) external onlyOwner {
        require(bets[_id].state == BetState.pending);
        approve(owner, _amount);
        transferFrom(owner, _bettor1, _amount.mul(returnedTokens).div(10000));
        bets[_id].state = BetState.close;
        emit BetClosed(block.timestamp, _id);
    }

    /*
       @dev Bettor 1 cancels the bet, tokens are returned to the Bettor 1, state changed to Close and event emitted
       @param _bettor1 Bettor's 1 address
       @param _amount Quantity of tokens of the bet

    function betCloseFromPendingCancelBet(uint256 _amount, uint256 _id) external {
        require(bets[_id].state == BetState.pending);
        require(bets[_id].bettor1 == msg.sender);
        approve(owner, _amount);
        transferFrom(owner, msg.sender, _amount);
        bets[_id].state = BetState.close;
        emit BetClosed(block.timestamp, _id);
    }*/

    /*
        @dev If a remake occurs, tokens are returned to the bettors, state changed to Close and event emitted
        @param _bettor1 Bettor's 1 address
        @param _bettor1 Bettor's 2 address
        @param _amount Quantity of tokens of a bet (question: pass the winning tokens or the betting tokens)
    */
    function betCloseRemake(address _bettor1, address _bettor2, uint256 _amount, uint256 _id) external {
        approve(owner, _amount.mul(2));
        transferFrom(owner, _bettor1, _amount);
        transferFrom(owner, _bettor2, _amount);
        bets[_id].state = BetState.close;
        emit BetClosed(block.timestamp, _id);
    }


    function betState(uint256 _id) external view returns (BetState state) {
        state = bets[_id].state;
    }

    // Function that is called from a user
    function buyTokensPassEthers() external payable {
        require(msg.value > 0);
        tokensToBuy[msg.sender] = tokensToBuy[msg.sender].add(msg.value.mul(tokenBuyPrice).div(10**18));
        emit BuyTokensSendEthers(msg.sender, msg.value.mul(tokenBuyPrice).div(10**18));
        owner.transfer(msg.value);
    }

    // Function that is called from owner
    function buyTokensPassTokens(address _address, uint _tokens) external onlyOwner {
        require(_tokens > 0);
        require(tokensToBuy[_address] >= _tokens);
        tokensToBuy[_address] = tokensToBuy[_address].sub(_tokens);
        approve(_address, _tokens);
        transfer(_address, _tokens);
        emit BuyTokensSendTokens(msg.sender, _tokens);
    }

    // Function that is called from a user
    function sellTokensPassTokens(uint _tokens) external {
        require(_tokens > 0);
        tokensToSell[msg.sender] = tokensToSell[msg.sender].add(_tokens);
        approve(owner, _tokens);
        transfer(owner, _tokens);
        emit SellTokensSendTokens(msg.sender, _tokens);
    }
    // Function that is called from the owner
    function sellTokensPassEthers(address payable _address, uint _tokens) external payable onlyOwner {
        require(msg.value > 0);
        require(tokensToSell[_address] >= _tokens);
        tokensToSell[_address] = tokensToSell[_address].sub(_tokens);
        emit SellTokensSendEthers(msg.sender, _tokens);
        _address.transfer(msg.value);
    }

}
