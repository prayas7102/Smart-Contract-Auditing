const { ethers } = require("hardhat");

describe("Phisable", function () {
  let owner;
  let attacker;
  let phisableContract;
  let attackContract;

  beforeEach(async function () {
    // Deploy Phisable contract
    const Phisable = await ethers.getContractFactory("Phisable");
    owner = await ethers.provider.getSigner(0);
    phisableContract = await Phisable.deploy(owner.address);
    await phisableContract.deployed();

    // Deploy Attack contract
    const Attack = await ethers.getContractFactory("Attack");
    attacker = await ethers.provider.getSigner(1);
    attackContract = await Attack.deploy(phisableContract.address, attacker.address);
    await attackContract.deployed();
  });

  it("should allow the owner to withdraw all funds", async function () {
    const initialBalance = await ethers.provider.getBalance(phisableContract.address);
    const amountToSend = ethers.utils.parseEther("1");

    // Send some ether to Phisable contract
    await owner.sendTransaction({
      to: phisableContract.address,
      value: amountToSend,
    });

    // Withdraw all funds from Phisable contract
    await phisableContract.withdrawAll(attacker.address);

    // Check that the funds were transferred to the attacker's address
    const finalBalance = await ethers.provider.getBalance(attacker.address);
    expect(finalBalance.sub(initialBalance)).to.eq(amountToSend);
  });

  it("should not allow an attacker to withdraw all funds through UnsafeOperation", async function () {
    const initialBalance = await ethers.provider.getBalance(phisableContract.address);
    const amountToSend = ethers.utils.parseEther("1");

    // Send some ether to Phisable contract
    await owner.sendTransaction({
      to: phisableContract.address,
      value: amountToSend,
    });

    // Try to withdraw all funds through UnsafeOperation from Attack contract
    await expect(attackContract.UnsafeOperation()).to.be.revertedWith("revert");

    // Check that all funds are still in the Phisable contract
    const finalBalance = await ethers.provider.getBalance(phisableContract.address);
    expect(finalBalance).to.eq(initialBalance);
  });
});
