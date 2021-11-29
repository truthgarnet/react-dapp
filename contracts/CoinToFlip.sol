pragma solidity ^0.8.0;

contract CoinToFlip {
    uint constant MAX_CASE = 2;
    uint constant MIN_BET = 0.1 ether;
    uint constant MAX_BET = 10 ether;
    uint constant HOUSE_FEE_PERCENT = 5;
    uint constant HOUSE_MIN_FEE = 0.005 ether;

    address payable public owner;
    uint public lockedInBets;

    struct Bet {
        uint amount;
        uint8 numOfBetBit;
        uint8 mask;
        address payable gambler;
    }

    mapping(address => Bet) bets;

    event Reveal(address indexed gambler, uint reveal, uint amount);
    event Payment(address indexed beneficiary, unit amount);
    event FailedPayment(address indexed beneficiary, unit amount);

    constructor () public{
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owmer can call this function.");
        _;
    }

    function withdrawFunds(address payable beneficiary, uint withdrawAmount) external onlyOwner {
        require(withdrawAmount + lockedInBets <= address(this).balance, "larger than balance.");
        sendFunds(beneficiary, withdrawAmount);
    }


}
