const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Self Destruct', () => {
  let nft,
    attack

  let deployer,
    collector1,
    collector2,
    attacker

  beforeEach(async () => {
    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy()

    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    collector1 = accounts[1]
    collector2 = accounts[2]
    attacker = accounts[4]

    const Attack = await ethers.getContractFactory('Attack')
    attack = await Attack.deploy(nft.address)
  })

  describe('the vulnerbility', () => {
    let transaction, result

    it('forces Ether into the contract & breaks minting', async () => {
      console.log("\nNFT contract address: ", nft.address)
      // Collector 1 mints a token
      transaction = await nft.connect(collector1).mint({ value: ether(1) })
      await transaction.wait()

      expect(await nft.ownerOf(1)).to.equal(collector1.address)
      expect(await ethers.provider.getBalance(nft.address)).to.equal(ether(1))
      console.log("\nCollector 1: ", collector1.address)
      console.log("-> was able to deposit 1 ether")

      // Attacker performs selfDestruct attack
      transaction = await attack.connect(attacker).attack({ value: ether(100) })
      await transaction.wait()
      console.log("\nAttacker: ", attacker.address)
      console.log("-> performs self destruct")

      expect(await ethers.provider.getBalance(nft.address)).to.equal(ether(101))
      console.log("\nBalance of nft contract: ", await ethers.provider.getBalance(nft.address))
      console.log("Cannot mint anymore nft as balance > 100 ether (DOS attack)")

      // Cannot mint NFTs anymore
      await expect(nft.connect(collector2).mint({ value: ether(1) })).to.be.reverted

    })
  })
})
