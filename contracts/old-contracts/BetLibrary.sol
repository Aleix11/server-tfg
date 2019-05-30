pragma solidity >= 0.4.0 <0.6.0;

library BetLibrary {

    enum BetState { open, close, pending }

    struct Bet {
        uint256 amount;
        BetState state;
        address bettor1;
        address bettor2;
    }

    function newBet(Bet storage self, address _bettor1, uint256 _amount) public {
        self.amount = _amount;
        self.bettor1 = _bettor1;
        self.state = BetState.pending;
    }

    function acceptBet(Bet storage self, address _bettor2, uint256 _amount) public {
        require(self.state == BetState.pending);
        require(self.amount == _amount);
        require(self.bettor1 != _bettor2);
        self.bettor2 = _bettor2;
        self.state = BetState.open;
    }

    function closeBet(Bet storage self) public {
        self.state = BetState.close;
    }
}
