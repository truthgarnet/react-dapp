pragma solidity ^0.5.16;

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
        uint placeBlockNumber;
        uint8 mask;
        address payable gambler;
    }

    mapping(address => Bet) bets;

    event Reveal(address indexed gambler, uint reveal, uint amount);
    event Payment(address indexed beneficiary, uint amount);
    event FailedPayment(address indexed beneficiary, uint amount);

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

    function kill() external onlyOwner {
        require(lockedInBets == 0, "all bets should be processed before self-destruct");
        selfdestruct(owner);
    }

    function () external payable {}

    function placeBet(uint8 betMask) external payable {
        uint amount = msg.value;

        require(amount >= MIN_BET && amount <= MAX_BET, "Amount is out of range");
        //What is betMask
        require(betMask > 0 && betMask < 256, "Mask should be 8 bit");

        Bet storage bet = bets[msg.sender];

        require(bet.gambler == address(0), "Bet should be empty state.");

        uint8 numOfBetBit = countBits(betMask);

        uint possibleWinningAmount = getWinningAmount(amount, numOfBetBit);
        lockedInBets += possibleWinningAmount;

        require(lockedInBets < address(this).balance, "Cannot afford to pay the bet");

        bet.amount = amount;
        bet.numOfBetBit = numOfBetBit;
        bet.placeBlockNumber = block.number;
        bet.mask = betMask;
        bet.gambler = msg.sender;
    }

    function getWinningAmount(uint amount, uint8 numOfBetBit) private pure returns (uint winningAmount) {
        require(0 < numOfBetBit && numOfBetBit < MAX_CASE, "Probability is out of range");

        uint houseFee = amount * HOUSE_FEE_PERCENT / 100;

        if (houseFee < HOUSE_MIN_FEE) {
            houseFee = HOUSE_MIN_FEE;
        }

        uint reward = amount / (MAX_CASE + (numOfBetBit-1));

        winningAmount = (amount - houseFee) + reward;
    }

    function revealResult() external {
        Bet storage bet = bets[msg.sender];
        uint amount = bet.amount;
        uint8 numOfBetBit = bet.numOfBetBit;
        uint placeBlockNumber = bet.placeBlockNumber;
        address payable gambler = bet.gambler;

        require(amount > 0, "Bet should be in an active state");

        require(block.number > placeBlockNumber, "revealResult in the same block as placeBet, or before.");

        bytes32 random = keccak256(abi.encodePacked(blockhash(block.number), blockhash(placeBlockNumber)));
        uint reveal = uint(random) % MAX_CASE;

        uint winningAmount = 0;
        uint possibleWinningAmount = 0;
        possibleWinningAmount = getWinningAmount(amount, numOfBetBit);

        if((2 ** reveal) & bet.mask != 0) {
            winningAmount = possibleWinningAmount;
        }

        emit Reveal(gambler, 2 ** reveal, winningAmount);

        lockedInBets -= possibleWinningAmount;
        clearBet(msg.sender);

        if(winningAmount > 0) {
            sendFunds(gambler, winningAmount);
        }
    }

    function sendFunds(address payable beneficiary, uint amount) private {
        if(beneficiary.send(amount)) {
            emit Payment(beneficiary, amount);
        }else {
            emit FailedPayment(beneficiary, amount);
        }
    }

    function clearBet(address player) private {
        Bet storage bet = bets[player];

        bet.amount = 0;
        bet.numOfBetBit = 0;
        bet.placeBlockNumber = 0;
        bet.mask = 0;
        bet.gambler = address(0);
    }

    function refundBet() external {
        Bet storage bet = bets[msg.sender];

        uint8 numOfBetBit = bet.numOfBetBit;
        uint amount = bet.amount;
        address payable gambler = bet.gambler;

        require(block.number > bet.placeBlockNumber, "refunBet in ths same block as placeBet, or before.");
        require(amount > 0, "Bet should be in an active state");

        uint possibleWinningAmount;
        possibleWinningAmount = getWinningAmount(amount, numOfBetBit);

        lockedInBets -= possibleWinningAmount;
        clearBet(msg.sender);

        sendFunds(gambler, amount);
    }

    function checkHouseFund() public view onlyOwner returns(uint) {
        return address(this).balance;
    }

    function countBits(uint8 _num) internal pure returns (uint8) {
        uint8 count;
        while(_num > 0) {
            count += _num & 1;
            _num >>= 1;
        }
        return count;
    }
}
