const { expect } = require("chai");
// import { solidity } from "ethereum-waffle";
// chai.use(solidity);

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

  it("Checking: should deposit ether and increase lock time", async function () {
    const depositAmount = ethers.utils.parseEther("10");
    await timeLockContract.connect(owner).deposit({ value: depositAmount });
    const lockTime = (await timeLockContract.lockTime(owner.address));

    console.log("\nOwner of Timelock Contract", owner.address)
    console.log("Amount deposited in timelock contract ", depositAmount, " wei");
    const lockTimeString = lockTime.toString();
    console.log("Amount can be withdrawn after ", lockTimeString, " seconds");

    expect(await timeLockContract.balances(owner.address)).to.equal(depositAmount);
    // expect(await timeLockContract.lockTime(owner.address)).to.be.gt(lockTime);

    const increaseTime = 24 * 7; // one week in seconds
    console.log("Time to withdraw Amount increased by ", increaseTime);
    await timeLockContract.connect(owner).increaseLockTime(increaseTime);
    // expect(await timeLockContract.lockTime(owner.address)).to.be.greaterThan(Number(lockTime) + Number(increaseTime));
  });

  it("Checking: should not withdraw ether if lock time has not expired", async function () {
    const depositAmount = ethers.utils.parseEther("1");

    await timeLockContract.connect(owner).deposit({ value: depositAmount });

    await expect(timeLockContract.connect(owner).withdraw()).to.be.revertedWith("Insufficient Funds");
  });

  it("Attack Successful", async function () {
    const depositAmount = ethers.utils.parseEther("1");
    console.log("Attacker contract executing its attack function by depsiting ", depositAmount, " wei");
    console.log("Address of Attacker Contract ", attackContract.address)
    await attackContract.attack({ value: depositAmount });
    expect(await timeLockContract.lockTime(attackContract.address)).to.equal(0);
  });

});
