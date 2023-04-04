// Import Hardhat
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Start test block
describe("Honeypot Contract", function () {
  let honeypot;
  let bank;
  let logger;

  beforeEach(async function () {
    // Deploy the Logger contract
    const Logger = await ethers.getContractFactory("Logger");
    logger = await Logger.deploy();

    // Deploy the Bank contract with the address of the Logger contract
    const Bank = await ethers.getContractFactory("Bank");
    bank = await Bank.deploy(logger.address);

    // Deploy the Honeypot contract
    const Honeypot = await ethers.getContractFactory("Honeypot");
    honeypot = await Honeypot.deploy();
  });

  it("should revert the transaction on withdraw", async function () {
    // Call the attack function on the Attack contract
    const Attack = await ethers.getContractFactory("Attack");
    const attack = await Attack.deploy(bank.address);

    await attack.attack({ value: ethers.utils.parseEther("1") });

    // Check that the balance of the Honeypot contract is now 1 ETH
    const honeypotBalance = await ethers.provider.getBalance(honeypot.address);
    expect(honeypotBalance).to.equal(ethers.utils.parseEther("1"));
  });
});
