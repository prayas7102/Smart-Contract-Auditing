// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract DOS {
    mapping(address => uint256) public balances;
    // mapping(address => uint256) public reputation;
    function deposit() public payable {
        require(msg.value > 0); 
        // require(msg.value > 1 ether || (msg.value>0 && reputation[msg.sender]<=100));
        balances[msg.sender] += msg.value;
        // reputation[msg.sender]++;
    }

    function withdraw(uint amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}

contract Attack{
    function attack(DOS dos) public{
        uint counter;
        while(counter<10000000){
            dos.deposit{value: 1 ether}();
            counter++;
        }
    }
    receive() external payable{}
}