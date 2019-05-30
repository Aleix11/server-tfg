pragma solidity  >= 0.4.0 <0.6.0;

import './IERC20.sol';
import './SafeMath.sol';

contract ERC20 is IERC20 {
    using SafeMath for uint256;

    uint256 numTokens;

    // Tokens data and metadata arrays
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    constructor() public {
        numTokens = 1000000 * 10**uint(18);
        balances[msg.sender] = numTokens;
        emit Transfer(address(0), msg.sender, numTokens);
    }

    // METADATA FUNCTIONS
    function name() external pure returns (string memory _name){
        return "GoinCoin";
    }

    function symbol() external pure returns (string memory _symbol){
        return "⚖️";
    }

    function totalSupply() public view returns (uint256 _totalSupply){
        return numTokens;
    }


    function balanceOf(address _owner) public view returns (uint256 _balance) {
        return balances[_owner];
    }

    function allowance(address _tokenOwner, address _spender) public view returns (uint remaining) {
        return allowed[_tokenOwner][_spender];
    }

    function transfer(address _to, uint256 _tokens) public returns (bool success) {
        balances[msg.sender] = balances[msg.sender].sub(_tokens);
        balances[_to] = balances[_to].add(_tokens);
        emit Transfer(msg.sender, _to, _tokens);
        return true;
    }

    function approve(address _spender, uint256 _tokens) public returns (bool success) {
        allowed[msg.sender][_spender] = _tokens;
        emit Approval(msg.sender, _spender, _tokens);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _tokens) public returns (bool success) {
        balances[_from] = balances[_from].sub(_tokens);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_tokens);
        balances[_to] = balances[_to].add(_tokens);
        emit Transfer(_from, _to, _tokens);
        return true;
    }
}