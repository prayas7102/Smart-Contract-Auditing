const { expect } = require("chai");

describe("TimeLock", function() {
  let timeLock;
  let owner;
  let attacker;

  before(async function() {
    const TimeLock = await ethers.getContractFactory("TimeLock");
    timeLock = await TimeLock.deploy();
    await timeLock.deployed();

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

  it("should withdraw ether if lock time has expired", async function() {
    const depositAmount = ethers.utils.parseEther("1");

    await timeLock.connect(owner).deposit({ value: depositAmount });
    await timeLock.connect(owner).increaseLockTime(60); // wait for one minute

    const balanceBefore = await ethers.provider.getBalance(owner.address);

    await timeLock.connect(owner).withdraw();

    const balanceAfter = await ethers.provider.getBalance(owner.address);
    const gasUsed = (await ethers.provider.getTransactionReceipt(timeLock.transactionHash)).gasUsed;
    const expectedBalance = balanceBefore.add(depositAmount).sub(gasUsed);

    expect(balanceAfter).to.equal(expectedBalance);
    expect(await timeLock.balances(owner.address)).to.equal(0);
  });

});
