const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Delegate Call Attack', () => {
  let a, b, c

  beforeEach(async () => {
    const A = await ethers.getContractFactory('A')
    a = await A.deploy()

    const B = await ethers.getContractFactory('B')
    b = await B.deploy(a.address)

    const C = await ethers.getContractFactory('C')
    c = await C.deploy(b.address)

    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    attacker = accounts[1]
    console.log("Deployer Address:", deployer.address)
    console.log("Attacker Address:", attacker.address)
  })

  describe('the attack\n', () => {

    it('changes the ownership with delegateCall() exploit', async () => {
      // Check initial owner
      console.log("\n")
      console.log("Deployer deploys contract B, hence");
      console.log("Owner of contract B:", await b.owner())
      console.log("Address of contract C:", c.address)
      expect(await b.owner()).to.equal(deployer.address)

      // Perform the attack
      console.log("\nDelegate call attack getting executed");
      console.log("Attacker executes attack function in contract C");
      let tx = await c.connect(attacker).attack()
      await tx.wait()

      // Check the new owner
      console.log("\n")
      console.log("Owner of contract B is == Contract C's address:", await b.owner())
      expect(await b.owner()).to.equal(c.address)
    })

  })
})
