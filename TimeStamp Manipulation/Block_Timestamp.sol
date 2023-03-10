// block timestamp manipulation is used in:
// NFT Minting, Random Number generation, Timelock
// chain link for Random Number generation

pragma solidity ^0.8.0;

contract TimeStamp{
    constructor() payable{}
    function vulnerable() external payable{
        require(msg.value == 1 ether);
        if(block.timestamp%7 ==0){
            (bool sent, )=msg.sender.call(value:address(this).balance);
            require(sent, "Eth was not sent");
        }
    }
}