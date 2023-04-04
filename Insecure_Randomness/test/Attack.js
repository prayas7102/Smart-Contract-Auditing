const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GuessRandomNumber", function () {
  it("Should send ether to the contract and win the game", async function () {
    // Deploy GuessRandomNumber
    const GuessRandomNumber = await ethers.getContractFactory("GuessRandomNumber");
    const guessRandomNumber = await GuessRandomNumber.deploy();
    await guessRandomNumber.deployed();

    // Deploy Attack contract
    const Attack = await ethers.getContractFactory("Attack");
    const attack = await Attack.deploy();
    await attack.deployed();

    let [deployer] = await ethers.getSigners();
    console.log("Deployer Address:", deployer.address);

    // Send ether to GuessRandomNumber contract from Attack contract
    const amount = ethers.utils.parseEther("1.0");
    await deployer.sendTransaction({
      to: guessRandomNumber.address,
      value: amount,
    });

    await deployer.sendTransaction({
      to: attack.address,
      value: amount,
    });

    // Check contract balance
    const balanceBefore = await ethers.provider.getBalance(guessRandomNumber.address);
    const attackBalanceBefore = await ethers.provider.getBalance(attack.address);
    expect(balanceBefore).to.equal(amount);
    console.log("Balance of GuessRandomNumber contract before attack ", ethers.utils.formatEther(balanceBefore.toString()), "ether");
    console.log("Balance of Attack contract before attack ", ethers.utils.formatEther(attackBalanceBefore.toString()), "ether");

    // Guess the random number and win the game
    console.log("\nAttack getting executed");
    await attack.attack(guessRandomNumber.address);

    // Check contract balance after winning
    const balanceAfter = await ethers.provider.getBalance(guessRandomNumber.address);
    expect(balanceAfter).to.equal(0);
    console.log("Balance of GuessRandomNumber contract after attack ", ethers.utils.formatEther(balanceAfter.toString()), "ether");

    // Check attacker balance after winning
    const attackerBalance = await ethers.provider.getBalance(attack.address);
    expect(attackerBalance).to.equal(BigInt(amount) + BigInt(attackBalanceBefore));
    console.log("Balance of Attack contract after attack ", ethers.utils.formatEther(attackerBalance.toString()), "ether");

  });
});

