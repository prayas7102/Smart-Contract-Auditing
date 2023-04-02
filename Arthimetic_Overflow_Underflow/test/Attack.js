const { expect } = require("chai");

describe("Arthimetic_Overflow_Underflow", function() {
  let timeLock, attack;
  let owner;
  let attacker;

  before(async function() {
    const TimeLock = await ethers.getContractFactory("TimeLock");
    timeLock = await TimeLock.deploy();
    await timeLock.deployed();

    const Attack = await ethers.getContractFactory("Attack");
    attack = await Attack.deploy(timeLock.address);
    await attack.deployed();

    [owner, attacker] = await ethers.getSigners();
  });

  it("should deposit ether and increase lock time", async function() {
    const depositAmount = ethers.utils.parseEther("1");
    const lockTime = (await timeLock.lockTime(owner.address)).toNumber();

    await timeLock.connect(owner).deposit({ value: depositAmount });

    expect(await timeLock.balances(owner.address)).to.equal(depositAmount);
    expect(await timeLock.lockTime(owner.address)).to.be.above(lockTime);

    const increaseTime = 60 * 60 * 24 * 7; // one week in seconds
    await timeLock.connect(owner).increaseLockTime(increaseTime);

    expect(await timeLock.lockTime(owner.address)).to.be.above(lockTime + increaseTime);
  });

  it("should not withdraw ether if lock time has not expired", async function() {
    const depositAmount = ethers.utils.parseEther("1");

    await timeLock.connect(owner).deposit({ value: depositAmount });

    await expect(timeLock.connect(owner).withdraw()).to.be.revertedWith("Insufficient Funds");
  });

  it("Attack Successful", async function() {
    const depositAmount = ethers.utils.parseEther("1");
    await attack.attack({ value: depositAmount });
    console.log(await timeLock.lockTime(attack.address))
    expect(await timeLock.lockTime(attack.address)).to.equal(0);
  });

});
