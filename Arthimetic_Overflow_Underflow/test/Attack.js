const { expect } = require("chai");
const { ethers } = require("hardhat");
const assert = require("assert");


describe("Arthimetic_Overflow_Underflow", function () {
  let timeLockContract, attackContract;
  let owner;

  before(async function () {
    const TimeLock = await ethers.getContractFactory("TimeLock");
    timeLockContract = await TimeLock.deploy();
    await timeLockContract.deployed();

    const Attack = await ethers.getContractFactory("Attack");
    attackContract = await Attack.deploy(timeLockContract.address);
    await attackContract.deployed();

    [owner, attacker] = await ethers.getSigners();
  });

  console.log("\n");
  
  it("Checking: should deposit ether and increase lock time", async function () {
    const depositAmount = ethers.utils.parseEther("10");
    await timeLockContract.connect(owner).deposit({ value: depositAmount });
    const lockTime = (await timeLockContract.lockTime(owner.address));

    console.log("\nOwner of Timelock Contract", owner.address)
    console.log("Amount deposited in timelock contract: ", ethers.utils.formatEther(depositAmount), " ether");
    const lockTimeString = lockTime.toString();
    console.log("Amount can be withdrawn after: ", lockTimeString, " seconds");

    expect(await timeLockContract.balances(owner.address)).to.equal(depositAmount);
    assert.equal((await timeLockContract.lockTime(owner.address)).toString(), lockTime.toString(), "Error in adding time limit for amount withdrawal");

    const increaseTime = 24 * 60 * 60 * 7; // one week in seconds
    console.log("Time to withdraw Amount increased by: ", increaseTime, " seconds");
    await timeLockContract.connect(owner).increaseLockTime(increaseTime);
    assert.equal((await timeLockContract.lockTime(owner.address)).toString(), (Number(lockTime) + Number(increaseTime)).toString(), "Error in adding time limit for amount withdrawal");
  });

  console.log("\n");
  it("Checking: should not withdraw ether if lock time has not expired", async function () {
    const depositAmount = ethers.utils.parseEther("1");

    await timeLockContract.connect(owner).deposit({ value: depositAmount });

    await expect(timeLockContract.connect(owner).withdraw()).to.be.revertedWith("Insufficient Funds");
  });

  it("Attack Successful", async function () {
    const depositAmount = ethers.utils.parseEther("1");
    console.log("\nAddress of Attacker Contract ", attackContract.address);
    console.log("Attacker contract executing its attack function by depositing: ", ethers.utils.formatEther(depositAmount), " ether");
    
    await attackContract.attack({ value: depositAmount });

    expect(await timeLockContract.lockTime(attackContract.address)).to.equal(0);
    console.log("After Attack:");
    console.log("Lock time of attacker contract = ", Number(await timeLockContract.lockTime(attackContract.address)))
    console.log("Balance of Attack Contract ", ethers.utils.formatEther(await ethers.provider.getBalance(attackContract.address)));
  });

});
