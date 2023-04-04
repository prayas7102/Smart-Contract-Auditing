// block timestamp manipulation is used in:
// NFT Minting, Random Number generation, Timelock
// chain link for Random Number generation

pragma solidity ^0.8.0;

contract TimeStamp {
    constructor() payable {}

    function vulnerable() external payable {
        require(msg.value == 1 ether);
        if (block.timestamp % 7 == 0) {
            (bool sent, ) = msg.sender.call{value: address(this).balance}("");
            require(sent, "Eth was not sent");
        }
    }
}

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract RandomNumberGenerator is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;

    constructor()
        VRFConsumerBase(
            0x0000000000000000000000000000000000000000, // replace with your own Chainlink VRF coordinator address
            0x0000000000000000000000000000000000000000 // replace with your own Chainlink LINK token address
        )
    {
        keyHash = bytes32("your_key_hash"); // replace with your own key hash
        fee = 0.1 * 10 ** 18; // replace with the fee for your oracle
    }

    function getRandomNumber() public returns (uint256) {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK to request"
        );
        uint256 randomness;
        bytes32 requestId = requestRandomness(keyHash, fee);
        // wait for the oracle to respond with the random number
        // the fulfillRandomness function will be called when the response is received
        return randomness;
    }
}
