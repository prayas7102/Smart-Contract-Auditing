// SPDX-License-Identifier: Unlicense
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrant Contract\n", function () {
  let vulnerable;
  let attack;

  beforeEach(async () => {
    const Vulnerable = await ethers.getContractFactory("Vulnerable");
    const Attack = await ethers.getContractFactory("Attack");

    vulnerable = await Vulnerable.deploy();
    await vulnerable.deployed();

    attack = await Attack.deploy(vulnerable.address);
    await attack.deployed();
  });

  it("should allow users to deposit ether", async function () {
    await vulnerable.deposit({ value: 100 });
    expect(await vulnerable.balances(ethers.provider.getSigner(0).getAddress())).to.equal(100);
    console.log("Contract Vulnerable: ", vulnerable.address)
    console.log("Balance in Vulnerable Contract ",(await vulnerable.getBalance()))
  });

  it("should allow users to withdraw their ether", async function () {
    await vulnerable.deposit({ value: 100 });
    await vulnerable.withdraw();
    expect(await vulnerable.balances(ethers.provider.getSigner(0).getAddress())).to.equal(0);
  });

  it("should be able to steal ether from the vulnerable contract", async function () {
    let [deployer, attacker] = await ethers.getSigners();

    const initialBalance = await ethers.provider.getBalance(attack.address);

    console.log("\nContract Attack: ", attack.address)
    console.log("initialBalance of this contract: ", (initialBalance).toString())
    console.log("Attack function getting executed:")
    
    await attack.connect(attacker).attack({ value: ethers.utils.parseEther("1") });

    const finalBalance = await ethers.provider.getBalance(attack.address);
    console.log("\nFinalBalance of Attack contract ",(finalBalance))
    expect(finalBalance).to.be.gt(initialBalance);
  });
});
