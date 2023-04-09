// Import Hardhat
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Start test block
describe("Honeypot Contract", function () {
  let honeypot;
  let bank;
  let logger,attacker;

  beforeEach(async function () {
    // Deploy the Logger contract
    const Logger = await ethers.getContractFactory("Logger");
    logger = await Logger.deploy();
    logger.deployed();     
    // Deploy the Honeypot contract
    const Honeypot = await ethers.getContractFactory("Honeypot");
    honeypot = await Honeypot.deploy();
    honeypot.deployed();
    // Deploy the Bank contract with the address of the Logger contract
    const Bank = await ethers.getContractFactory("Bank");
    bank = await Bank.deploy(Honeypot.address);
    bank.deployed();    
  });

  it("should revert the transaction on withdraw", async function () {
    // Call the attack function on the Attack contract
    [attacker] = await ethers.getSigners();
    const value = ethers.utils.parseEther('10');   
    await attacker.sendTransaction({ to: attack.address, value });
    const Attack = await ethers.getContractFactory("Attack");
    const attack = await Attack.deploy(bank);
    await attack.attack({ value: ethers.utils.parseEther("1") })
    await expect(await attack.attack({ value: ethers.utils.parseEther("1") })).to.be.reverted
  });
});
