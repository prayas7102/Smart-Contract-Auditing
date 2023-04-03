const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Attack', () => {
  let GuessRandomNumberContract, AttackContract;

  beforeEach(async () => {
    const GuessRandomNumber = await ethers.getContractFactory('GuessRandomNumber')
    GuessRandomNumberContract = await GuessRandomNumber.deploy()

    const Attack = await ethers.getContractFactory('Attack')
    AttackContract = await Attack.deploy()

    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    attacker = accounts[1]
    console.log("Deployer Address:", deployer.address)
    console.log("Attacker Address:", attacker.address)
  })

  describe('the attack', () => {

    it('changes the ownership with delegateCall() exploit', async () => {
      // Check initial owner
      console.log("Balance of Attack contrcat before performing attack:", await AttackContract.getBalance());
      await AttackContract.attack(GuessRandomNumberContract.address)
      console.log("Balance of Attack contrcat before performing attack:", await AttackContract.getBalance());
    })

  })
})
